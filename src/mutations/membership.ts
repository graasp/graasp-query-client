import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { List } from 'immutable';
import { QueryClient } from 'react-query';

import {
  Invitation,
  ItemMembership,
  PermissionLevel,
  UUID,
  isError,
  partition,
} from '@graasp/sdk';
import { ItemMembershipRecord } from '@graasp/sdk/frontend';
import { SUCCESS_MESSAGES } from '@graasp/translations';

import * as Api from '../api';
import {
  MUTATION_KEYS,
  buildItemInvitationsKey,
  buildItemMembershipsKey,
  buildManyItemMembershipsKey,
} from '../config/keys';
import {
  deleteItemMembershipRoutine,
  editItemMembershipRoutine,
  postItemMembershipRoutine,
  shareItemRoutine,
} from '../routines';
import { QueryClientConfig } from '../types';

export default (
  queryClient: QueryClient,
  queryConfig: QueryClientConfig,
): void => {
  const { notifier } = queryConfig;

  queryClient.setMutationDefaults(MUTATION_KEYS.POST_ITEM_MEMBERSHIP, {
    mutationFn: (payload) => Api.postItemMembership(payload, queryConfig),
    onSuccess: () => {
      notifier?.({
        type: postItemMembershipRoutine.SUCCESS,
        payload: { message: SUCCESS_MESSAGES.SHARE_ITEM },
      });
    },
    onError: (error) => {
      notifier?.({
        type: postItemMembershipRoutine.FAILURE,
        payload: { error },
      });
    },
    onSettled: (_data, _error, { id }) => {
      // invalidate memberships
      // todo: invalidate all pack of memberships containing the given id
      // this won't trigger too many errors as long as the stale time is low
      queryClient.invalidateQueries(buildManyItemMembershipsKey([id]));
      queryClient.invalidateQueries(buildItemMembershipsKey(id));
    },
  });

  /**
   * @param {UUID} id membership id to edit
   * @param {UUID} itemId corresponding item id
   * @param {PermissionLevel} permission permission level to apply
   */
  queryClient.setMutationDefaults(MUTATION_KEYS.EDIT_ITEM_MEMBERSHIP, {
    mutationFn: ({
      id,
      permission,
    }: {
      id: UUID;
      permission: PermissionLevel;
    }) => Api.editItemMembership({ id, permission }, queryConfig),
    onSuccess: () => {
      notifier?.({
        type: editItemMembershipRoutine.SUCCESS,
        payload: { message: SUCCESS_MESSAGES.EDIT_ITEM_MEMBERSHIP },
      });
    },
    onError: (error) => {
      notifier?.({
        type: editItemMembershipRoutine.FAILURE,
        payload: { error },
      });
    },
    // Always refetch after error or success:
    onSettled: (_data, _error, { itemId }) => {
      queryClient.invalidateQueries(buildItemMembershipsKey(itemId));
    },
  });

  queryClient.setMutationDefaults(MUTATION_KEYS.DELETE_ITEM_MEMBERSHIP, {
    mutationFn: ({ id }) => Api.deleteItemMembership({ id }, queryConfig),
    onMutate: ({ itemId, id }) => {
      const membershipsKey = buildItemMembershipsKey(itemId);
      const memberships =
        queryClient.getQueryData<List<ItemMembershipRecord>>(membershipsKey);

      queryClient.setQueryData(
        membershipsKey,
        memberships?.filter(({ id: thisId }) => id !== thisId),
      );

      return { memberships };
    },
    onSuccess: () => {
      notifier?.({
        type: deleteItemMembershipRoutine.SUCCESS,
        payload: { message: SUCCESS_MESSAGES.DELETE_ITEM_MEMBERSHIP },
      });
    },
    onError: (error, { itemId }, context) => {
      const membershipsKey = buildItemMembershipsKey(itemId);
      queryClient.setQueryData(membershipsKey, context.memberships);
      notifier?.({
        type: deleteItemMembershipRoutine.FAILURE,
        payload: { error },
      });
    },
    // Always refetch after error or success:
    onSettled: (_data, _error, { itemId }) => {
      queryClient.invalidateQueries(buildItemMembershipsKey(itemId));
    },
  });

  // this mutation handles sharing an item to multiple emails
  // it will invite if the mail doesn't exist in the db
  // it will create a membership if an account exists
  queryClient.setMutationDefaults(MUTATION_KEYS.SHARE_ITEM, {
    mutationFn: async ({
      data,
      itemId,
    }: {
      data: Partial<Invitation>[];
      itemId: UUID;
    }) => {
      // validate has email, name and permission are optional
      // force type with email
      const [withEmail, withoutEmail] = partition(data, (d) =>
        Boolean(d.email),
      );
      const dataWithEmail = withEmail as (Partial<Invitation> & {
        email: string;
      })[];

      // no data with email: the column doesn't exist, or all empty
      // return custom failure
      if (!dataWithEmail.length) {
        throw new Error('No data or no column email detected');
      }

      // check email has an associated account
      // assume will receive only one member per mail
      const accounts = (
        await Api.getMembersBy(
          { emails: dataWithEmail.map(({ email }) => email) },
          queryConfig,
        )
      ).flat();

      // split between invitations and memberships
      const dataWithMemberId = dataWithEmail.map((d) => ({
        ...d,
        memberId: accounts.find(({ email }) => email === d.email?.toLowerCase())
          ?.id,
      }));
      const [newMemberships, invitations] = partition(dataWithMemberId, (d) =>
        Boolean(d.memberId),
      );

      // create memberships
      let membershipsResult: (ItemMembership | Error)[] = [];
      if (newMemberships.length) {
        try {
          membershipsResult = await Api.postManyItemMemberships(
            {
              memberships: newMemberships,
              itemId,
            },
            queryConfig,
          );
        } catch (e) {
          membershipsResult = [e as Error];
        }
      }

      // create invitations
      let invitationsResult: (Invitation | Error)[] = [];
      if (invitations.length) {
        try {
          invitationsResult = await Api.postInvitations(
            {
              itemId,
              invitations,
            },
            queryConfig,
          );
        } catch (e) {
          invitationsResult = [e as Error];
        }
      }

      const [mFailure, mSuccess] = partition(membershipsResult, (d) =>
        isError(d),
      );
      const [iFailure, iSuccess] = partition(invitationsResult, (d) =>
        isError(d),
      );

      const context = {
        success: [...mSuccess, ...iSuccess],
        failure: [
          // create error shape from input
          // todo: use error constructor
          ...withoutEmail.map((d) => ({
            statusCode: StatusCodes.BAD_REQUEST,
            message: ReasonPhrases.BAD_REQUEST,
            data: d,
          })),
          ...mFailure,
          ...iFailure,
        ],
      };
      return context;
    },
    onSuccess: (results) => {
      notifier?.({
        type: shareItemRoutine.SUCCESS,
        payload: results,
      });
    },
    onError: (error) => {
      notifier?.({
        type: shareItemRoutine.FAILURE,
        payload: { error },
      });
    },
    onSettled: (_data, _error, { itemId }) => {
      queryClient.invalidateQueries(buildItemMembershipsKey(itemId));
      queryClient.invalidateQueries(buildItemInvitationsKey(itemId));
    },
  });
};

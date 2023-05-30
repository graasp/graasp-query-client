import { AxiosError } from 'axios';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { List } from 'immutable';
import { QueryClient, useMutation } from 'react-query';

import {
  Invitation,
  ItemMembership,
  PermissionLevel,
  ResultOf,
  UUID,
  convertJs,
  partition,
} from '@graasp/sdk';
import { ItemMembershipRecord, ResultOfRecord } from '@graasp/sdk/frontend';
import { FAILURE_MESSAGES, SUCCESS_MESSAGES } from '@graasp/translations';

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

const {
  POST_ITEM_MEMBERSHIP,
  SHARE_ITEM,
  EDIT_ITEM_MEMBERSHIP,
  DELETE_ITEM_MEMBERSHIP,
} = MUTATION_KEYS;

export default (queryClient: QueryClient, queryConfig: QueryClientConfig) => {
  const { notifier } = queryConfig;

  queryClient.setMutationDefaults(POST_ITEM_MEMBERSHIP, {
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
  const usePostItemMembership = () =>
    useMutation<
      void,
      unknown,
      {
        id: UUID;
        email: string;
        permission: PermissionLevel;
      }
    >(POST_ITEM_MEMBERSHIP);

  /**
   * @param {UUID} id membership id to edit
   * @param {PermissionLevel} permission permission level to apply
   */
  queryClient.setMutationDefaults(EDIT_ITEM_MEMBERSHIP, {
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
  const useEditItemMembership = () =>
    useMutation<
      void,
      unknown,
      {
        id: UUID;
        permission: PermissionLevel;
      }
    >(EDIT_ITEM_MEMBERSHIP);

  queryClient.setMutationDefaults(DELETE_ITEM_MEMBERSHIP, {
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
  const useDeleteItemMembership = () =>
    useMutation<
      void,
      unknown,
      {
        id: UUID;
      }
    >(DELETE_ITEM_MEMBERSHIP);

  // this mutation handles sharing an item to multiple emails
  // it will invite if the mail doesn't exist in the db
  // it will create a membership if an account exists
  queryClient.setMutationDefaults(SHARE_ITEM, {
    mutationFn: async ({
      data,
      itemId,
    }: {
      data: Partial<Invitation>[];
      itemId: UUID;
    }): Promise<ResultOfRecord<ItemMembership | Invitation>> => {
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
      const accounts = await Api.getMembersBy(
        { emails: dataWithEmail.map(({ email }) => email) },
        queryConfig,
      );

      // split between invitations and memberships
      const dataWithMemberId = dataWithEmail.map((d) => ({
        ...d,
        memberId: accounts.data[d.email?.toLowerCase()]?.id,
      }));
      const [newMemberships, invitations] = partition(dataWithMemberId, (d) =>
        Boolean(d.memberId),
      );

      try {
        const dataForMemberships: ResultOf<ItemMembership> = {
          data: {},
          errors: [],
        };
        // create memberships
        if (newMemberships.length) {
          const membershipsResult: ResultOf<ItemMembership> =
            await Api.postManyItemMemberships(
              {
                memberships: newMemberships,
                itemId,
              },
              queryConfig,
            );
          // set map key to email
          Object.values(membershipsResult.data).forEach((m) => {
            dataForMemberships.data[m.member.email] = m;
          });
          dataForMemberships.errors = membershipsResult.errors;
        }

        // create invitations
        let invitationsResult: ResultOf<Invitation> = { data: {}, errors: [] };
        if (invitations.length) {
          invitationsResult = await Api.postInvitations(
            {
              itemId,
              invitations,
            },
            queryConfig,
          );
        }

        return convertJs({
          data: { ...dataForMemberships.data, ...invitationsResult.data },
          errors: [
            // create error shape from input
            // todo: use error constructor
            ...withoutEmail.map((d) => ({
              statusCode: StatusCodes.BAD_REQUEST,
              message: ReasonPhrases.BAD_REQUEST,
              data: d,
            })),
            ...invitationsResult.errors,
            ...dataForMemberships.errors,
          ],
        });
      } catch (e) {
        console.error(e);
        const errors = [];
        if (e instanceof AxiosError) {
          const error = e.response?.data;
          errors.push(error);
        } else {
          errors.push({
            name: 'error',
            message: FAILURE_MESSAGES.UNEXPECTED_ERROR,
          });
        }
        return convertJs({ data: {}, errors });
      }
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
  const useShareItem = () =>
    useMutation<
      ResultOfRecord<ItemMembership | Invitation>,
      unknown,
      {
        data: Partial<Invitation>[];
        itemId: UUID;
      }
    >(SHARE_ITEM);

  return {
    useShareItem,
    usePostItemMembership,
    useEditItemMembership,
    useDeleteItemMembership,
  };
};

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

import { AxiosError } from 'axios';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { List } from 'immutable';
import { useMutation, useQueryClient } from 'react-query';

import * as Api from '../api';
import {
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

export default (queryConfig: QueryClientConfig) => {
  const { notifier } = queryConfig;

  const usePostItemMembership = () => {
    const queryClient = useQueryClient();
    return useMutation(
      (payload: { id: UUID; email: string; permission: PermissionLevel }) =>
        Api.postItemMembership(payload, queryConfig),
      {
        onSuccess: () => {
          notifier?.({
            type: postItemMembershipRoutine.SUCCESS,
            payload: { message: SUCCESS_MESSAGES.SHARE_ITEM },
          });
        },
        onError: (error: Error) => {
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
      },
    );
  };

  /**
   * @param {UUID} id membership id to edit
   * @param {PermissionLevel} permission permission level to apply
   * @param {UUID} itemId item id to build key to invalidate
   */
  const useEditItemMembership = () => {
    const queryClient = useQueryClient();
    return useMutation(
      ({
        id,
        permission,
      }: {
        itemId: UUID;
        id: UUID;
        permission: PermissionLevel;
      }) => Api.editItemMembership({ id, permission }, queryConfig),
      {
        onSuccess: () => {
          notifier?.({
            type: editItemMembershipRoutine.SUCCESS,
            payload: { message: SUCCESS_MESSAGES.EDIT_ITEM_MEMBERSHIP },
          });
        },
        onError: (error: Error) => {
          notifier?.({
            type: editItemMembershipRoutine.FAILURE,
            payload: { error },
          });
        },
        // Always refetch after error or success:
        onSettled: (_data, _error, { itemId }) => {
          queryClient.invalidateQueries(buildItemMembershipsKey(itemId));
        },
      },
    );
  };

  /**
   * @param {UUID} id membership id to edit
   * @param {UUID} itemId item id to build key to invalidate
   */
  const useDeleteItemMembership = () => {
    const queryClient = useQueryClient();
    return useMutation(
      ({ id }: { id: UUID; itemId: UUID }) =>
        Api.deleteItemMembership({ id }, queryConfig),
      {
        onMutate: ({ itemId, id }) => {
          const membershipsKey = buildItemMembershipsKey(itemId);
          const memberships =
            queryClient.getQueryData<List<ItemMembershipRecord>>(
              membershipsKey,
            );

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
        onError: (error: Error, { itemId }, context) => {
          const membershipsKey = buildItemMembershipsKey(itemId);
          queryClient.setQueryData(membershipsKey, context?.memberships);
          notifier?.({
            type: deleteItemMembershipRoutine.FAILURE,
            payload: { error },
          });
        },
        // Always refetch after error or success:
        onSettled: (_data, _error, { itemId }) => {
          queryClient.invalidateQueries(buildItemMembershipsKey(itemId));
        },
      },
    );
  };

  /**
   * This mutation handles sharing an item to multiple emails
   * it will invite if the mail doesn't exist in the db
   * it will create a membership if an account exists
   */
  const useShareItem = () => {
    const queryClient = useQueryClient();
    return useMutation(
      async ({
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
          let invitationsResult: ResultOf<Invitation> = {
            data: {},
            errors: [],
          };
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
      {
        onSuccess: (results) => {
          notifier?.({
            type: shareItemRoutine.SUCCESS,
            payload: results,
          });
        },
        onError: (error: Error) => {
          notifier?.({
            type: shareItemRoutine.FAILURE,
            payload: { error },
          });
        },
        onSettled: (_data, _error, { itemId }) => {
          queryClient.invalidateQueries(buildItemMembershipsKey(itemId));
          queryClient.invalidateQueries(buildItemInvitationsKey(itemId));
        },
      },
    );
  };

  return {
    useShareItem,
    usePostItemMembership,
    useEditItemMembership,
    useDeleteItemMembership,
  };
};

import { Invitation, ItemMembership, PermissionLevel, UUID } from '@graasp/sdk';
import { SUCCESS_MESSAGES } from '@graasp/translations';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import * as InvitationApi from '../api/invitation.js';
import * as Api from '../api/membership.js';
import { buildManyItemMembershipsKey, itemKeys } from '../keys.js';
import {
  deleteItemMembershipRoutine,
  editItemMembershipRoutine,
  postItemMembershipRoutine,
  shareItemRoutine,
} from '../routines/membership.js';
import { QueryClientConfig } from '../types.js';

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
          queryClient.invalidateQueries(itemKeys.single(id).memberships);
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
          queryClient.invalidateQueries(itemKeys.single(itemId).memberships);
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
          const membershipsKey = itemKeys.single(itemId).memberships;
          const memberships =
            queryClient.getQueryData<ItemMembership[]>(membershipsKey);

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
          const membershipsKey = itemKeys.single(itemId).memberships;
          queryClient.setQueryData(membershipsKey, context?.memberships);
          notifier?.({
            type: deleteItemMembershipRoutine.FAILURE,
            payload: { error },
          });
        },
        // Always refetch after error or success:
        onSettled: (_data, _error, { itemId }) => {
          queryClient.invalidateQueries(itemKeys.single(itemId).memberships);
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
        invitations,
        itemId,
      }: {
        invitations: Pick<Invitation, 'email' | 'permission'>[];
        itemId: UUID;
      }): Promise<{
        memberships: ItemMembership[];
        invitations: Invitation[];
      }> =>
        InvitationApi.postInvitations(
          {
            itemId,
            invitations,
          },
          queryConfig,
        ),
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
          queryClient.invalidateQueries(itemKeys.single(itemId).memberships);
          queryClient.invalidateQueries(itemKeys.single(itemId).invitation);
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

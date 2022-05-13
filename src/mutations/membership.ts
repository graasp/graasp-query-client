import { QueryClient } from 'react-query';
import { List } from 'immutable';
import { SUCCESS_MESSAGES } from '@graasp/translations';
import * as Api from '../api';
import {
  deleteItemMembershipRoutine,
  editItemMembershipRoutine,
  postItemMembershipRoutine,
} from '../routines';
import {
  buildItemMembershipsKey,
  buildManyItemMembershipsKey,
  MUTATION_KEYS,
} from '../config/keys';
import { Membership, QueryClientConfig, UUID } from '../types';

export default (queryClient: QueryClient, queryConfig: QueryClientConfig) => {
  const { notifier } = queryConfig;

  queryClient.setMutationDefaults(MUTATION_KEYS.POST_ITEM_MEMBERSHIP, {
    mutationFn: (payload) => Api.shareItemWith(payload, queryConfig),
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
   * @param {PERMISSION_LEVELS} permission permission level to apply
   */
  queryClient.setMutationDefaults(MUTATION_KEYS.EDIT_ITEM_MEMBERSHIP, {
    mutationFn: ({ id, permission }: { id: UUID; permission: string }) =>
      Api.editItemMembership({ id, permission }, queryConfig),
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
        queryClient.getQueryData<List<Membership>>(membershipsKey);

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
};

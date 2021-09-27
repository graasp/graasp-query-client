import { QueryClient } from 'react-query';
import { List } from 'immutable';
import * as Api from '../api';
import {
  deleteItemMembershipRoutine,
  editItemMembershipRoutine,
} from '../routines';
import { buildItemMembershipsKey, MUTATION_KEYS } from '../config/keys';
import { Membership, QueryClientConfig, UUID } from '../types';

export default (queryClient: QueryClient, queryConfig: QueryClientConfig) => {
  const { notifier } = queryConfig;

  /**
   * @param {UUID} id membership id to edit
   * @param {UUID} itemId corresponding item id
   * @param {PERMISSION_LEVELS} permission permission level to apply
   */
  queryClient.setMutationDefaults(MUTATION_KEYS.EDIT_ITEM_MEMBERSHIP, {
    mutationFn: ({ id, permission }: { id: UUID; permission: string }) =>
      Api.editItemMembership({ id, permission }, queryConfig),
    onSuccess: () => {
      notifier?.({ type: editItemMembershipRoutine.SUCCESS });
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
      const memberships = queryClient.getQueryData<List<Membership>>(
        membershipsKey,
      );

      queryClient.setQueryData(
        membershipsKey,
        memberships?.filter(({ id: thisId }) => id !== thisId),
      );

      return { memberships };
    },
    onSuccess: () => {
      notifier?.({ type: deleteItemMembershipRoutine.SUCCESS });
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

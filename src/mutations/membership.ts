import { QueryClient } from 'react-query';
import * as Api from '../api';
import {
  deleteItemMembershipRoutine,
  editItemMembershipRoutine,
} from '../routines';
import { buildItemMembershipsKey, MUTATION_KEYS } from '../config/keys';
import { QueryClientConfig, UUID } from '../types';

export default (queryClient: QueryClient, queryConfig: QueryClientConfig) => {
  const { notifier } = queryConfig;

  // args: {id, itemId}
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
    onSuccess: () => {
      notifier?.({ type: deleteItemMembershipRoutine.SUCCESS });
    },
    onError: (error) => {
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

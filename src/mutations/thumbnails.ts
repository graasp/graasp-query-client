import { QueryClient } from 'react-query';
import * as Api from '../api';
import { editItemMembershipRoutine } from '../routines';
import { buildItemMembershipsKey, MUTATION_KEYS } from '../config/keys';
import { QueryClientConfig, UUID } from '../types';

export default (queryClient: QueryClient, queryConfig: QueryClientConfig) => {
  const { notifier } = queryConfig;

  /**
   * @param {UUID} id membership id to edit
   * @param {UUID} itemId corresponding item id
   * @param {PERMISSION_LEVELS} permission permission level to apply
   */
  queryClient.setMutationDefaults(MUTATION_KEYS.UPLOAD_ITEM_THUMBNAIL, {
    mutationFn: ({ id }: { id: UUID }) =>
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
};

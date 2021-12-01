import { QueryClient } from 'react-query';
import * as Api from '../api';
import { buildItemCategoryKey, MUTATION_KEYS } from '../config/keys';
import { deleteItemCategoryRoutine, postItemCategoryRoutine } from '../routines';
import { QueryClientConfig } from '../types';

export default (queryClient: QueryClient, queryConfig: QueryClientConfig) => {
  const { notifier } = queryConfig;

  queryClient.setMutationDefaults(MUTATION_KEYS.POST_ITEM_CATEGORY, {
    mutationFn: (payload) =>
      Api.postItemCategory(payload, queryConfig).then(() => payload),
    onSuccess: () => {
      notifier?.({ type: postItemCategoryRoutine.SUCCESS });
    },
    onError: (error) => {
      notifier?.({ type: postItemCategoryRoutine.FAILURE, payload: { error } });
    },
    onSettled: (_data, _error, { itemId }) => {
      queryClient.invalidateQueries(buildItemCategoryKey(itemId));
    },
  });

  queryClient.setMutationDefaults(MUTATION_KEYS.DELETE_ITEM_CATEGORY, {
    mutationFn: (payload) =>
      Api.deleteItemCategory(payload.entryId, queryConfig),
    onSuccess: () => {
      notifier?.({ type: deleteItemCategoryRoutine.SUCCESS });
    },
    onError: (error) => {
      notifier?.({ type: deleteItemCategoryRoutine.FAILURE, payload: { error } });
    },
    onSettled: (_data, _error, { itemId }) => {
      queryClient.invalidateQueries(buildItemCategoryKey(itemId));
    },
  });
};

import { SUCCESS_MESSAGES } from '@graasp/translations';
import { QueryClient } from 'react-query';
import * as Api from '../api';
import { buildItemCategoriesKey, MUTATION_KEYS } from '../config/keys';
import {
  deleteItemCategoryRoutine,
  postItemCategoryRoutine,
} from '../routines';
import { QueryClientConfig } from '../types';

export default (queryClient: QueryClient, queryConfig: QueryClientConfig) => {
  const { notifier } = queryConfig;

  queryClient.setMutationDefaults(MUTATION_KEYS.POST_ITEM_CATEGORY, {
    mutationFn: (payload) =>
      Api.postItemCategory(payload, queryConfig).then(() => payload),
    onSuccess: () => {
      notifier?.({
        type: postItemCategoryRoutine.SUCCESS,
        payload: { message: SUCCESS_MESSAGES.POST_ITEM_CATEGORY },
      });
    },
    onError: (error) => {
      notifier?.({ type: postItemCategoryRoutine.FAILURE, payload: { error } });
    },
    onSettled: (_data, _error, { itemId }) => {
      queryClient.invalidateQueries(buildItemCategoriesKey(itemId));
    },
  });

  queryClient.setMutationDefaults(MUTATION_KEYS.DELETE_ITEM_CATEGORY, {
    mutationFn: (payload) => Api.deleteItemCategory(payload, queryConfig),
    onSuccess: () => {
      notifier?.({
        type: deleteItemCategoryRoutine.SUCCESS,
        payload: { message: SUCCESS_MESSAGES.DELETE_ITEM_CATEGORY },
      });
    },
    onError: (error) => {
      notifier?.({
        type: deleteItemCategoryRoutine.FAILURE,
        payload: { error },
      });
    },
    onSettled: (_data, _error, { itemId }) => {
      queryClient.invalidateQueries(buildItemCategoriesKey(itemId));
    },
  });
};

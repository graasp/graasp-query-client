import { QueryClient, useMutation } from 'react-query';

import { UUID } from '@graasp/sdk';
import { SUCCESS_MESSAGES } from '@graasp/translations';

import * as Api from '../api';
import { MUTATION_KEYS, buildItemCategoriesKey } from '../config/keys';
import {
  deleteItemCategoryRoutine,
  postItemCategoryRoutine,
} from '../routines';
import { QueryClientConfig } from '../types';

const { POST_ITEM_CATEGORY, DELETE_ITEM_CATEGORY } = MUTATION_KEYS;

export default (queryClient: QueryClient, queryConfig: QueryClientConfig) => {
  const { notifier } = queryConfig;

  queryClient.setMutationDefaults(POST_ITEM_CATEGORY, {
    mutationFn: (payload) => Api.postItemCategory(payload, queryConfig),
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
  const usePostItemCategory = () =>
    useMutation<void, unknown, { itemId: UUID; categoryId: UUID }>(
      POST_ITEM_CATEGORY,
    );

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
  const useDeleteItemCategory = () =>
    useMutation<void, unknown, { itemCategoryId: UUID; itemId: UUID }>(
      DELETE_ITEM_CATEGORY,
    );

  return {
    usePostItemCategory,
    useDeleteItemCategory,
  };
};

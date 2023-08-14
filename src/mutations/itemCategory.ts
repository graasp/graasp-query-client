import { UUID } from '@graasp/sdk';
import { SUCCESS_MESSAGES } from '@graasp/translations';

import { useMutation, useQueryClient } from 'react-query';

import * as Api from '../api';
import { buildItemCategoriesKey } from '../config/keys';
import {
  deleteItemCategoryRoutine,
  postItemCategoryRoutine,
} from '../routines';
import { QueryClientConfig } from '../types';

export default (queryConfig: QueryClientConfig) => {
  const { notifier } = queryConfig;

  const usePostItemCategory = () => {
    const queryClient = useQueryClient();
    return useMutation(
      (payload: { itemId: UUID; categoryId: UUID }) =>
        Api.postItemCategory(payload, queryConfig),
      {
        onSuccess: () => {
          notifier?.({
            type: postItemCategoryRoutine.SUCCESS,
            payload: { message: SUCCESS_MESSAGES.POST_ITEM_CATEGORY },
          });
        },
        onError: (error: Error) => {
          notifier?.({
            type: postItemCategoryRoutine.FAILURE,
            payload: { error },
          });
        },
        onSettled: (_data, _error, { itemId }) => {
          queryClient.invalidateQueries(buildItemCategoriesKey(itemId));
        },
      },
    );
  };

  const useDeleteItemCategory = () => {
    const queryClient = useQueryClient();
    return useMutation(
      (payload: { itemCategoryId: UUID; itemId: UUID }) =>
        Api.deleteItemCategory(payload, queryConfig),
      {
        onSuccess: () => {
          notifier?.({
            type: deleteItemCategoryRoutine.SUCCESS,
            payload: { message: SUCCESS_MESSAGES.DELETE_ITEM_CATEGORY },
          });
        },
        onError: (error: Error) => {
          notifier?.({
            type: deleteItemCategoryRoutine.FAILURE,
            payload: { error },
          });
        },
        onSettled: (_data, _error, { itemId }) => {
          queryClient.invalidateQueries(buildItemCategoriesKey(itemId));
        },
      },
    );
  };

  return {
    usePostItemCategory,
    useDeleteItemCategory,
  };
};

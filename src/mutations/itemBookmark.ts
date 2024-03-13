import { UUID } from '@graasp/sdk';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import * as Api from '../api/itemBookmark.js';
import { memberKeys } from '../config/keys.js';
import {
  addBookmarkedItemRoutine,
  deleteBookmarkedItemRoutine,
} from '../routines/itemBookmark.js';
import { QueryClientConfig } from '../types.js';

export default (queryConfig: QueryClientConfig) => {
  const { notifier } = queryConfig;

  const useAddBookmarkedItem = () => {
    const queryClient = useQueryClient();
    return useMutation(
      (itemId: UUID) => Api.addBookmarkedItem(itemId, queryConfig),
      {
        onSuccess: () => {
          notifier?.({ type: addBookmarkedItemRoutine.SUCCESS });
        },
        onError: (error: Error) => {
          notifier?.({
            type: addBookmarkedItemRoutine.FAILURE,
            payload: { error },
          });
        },
        onSettled: () => {
          queryClient.invalidateQueries(memberKeys.current().bookmarkedItems);
        },
      },
    );
  };

  const useRemoveBookmarkedItem = () => {
    const queryClient = useQueryClient();
    return useMutation(
      (itemId: UUID) => Api.removeBookmarkedItem(itemId, queryConfig),
      {
        onSuccess: () => {
          notifier?.({ type: deleteBookmarkedItemRoutine.SUCCESS });
        },
        onError: (error: Error) => {
          notifier?.({
            type: deleteBookmarkedItemRoutine.FAILURE,
            payload: { error },
          });
        },
        onSettled: () => {
          queryClient.invalidateQueries(memberKeys.current().bookmarkedItems);
        },
      },
    );
  };

  return {
    useAddBookmarkedItem,
    useRemoveBookmarkedItem,
  };
};

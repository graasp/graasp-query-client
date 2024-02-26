import { UUID } from '@graasp/sdk';

import { useMutation, useQueryClient } from 'react-query';

import * as Api from '../api/itemFavorite.js';
import { memberKeys } from '../config/keys.js';
import {
  addFavoriteItemRoutine,
  deleteFavoriteItemRoutine,
} from '../routines/itemFavorite.js';
import { QueryClientConfig } from '../types.js';

export default (queryConfig: QueryClientConfig) => {
  const { notifier } = queryConfig;

  const useAddFavoriteItem = () => {
    const queryClient = useQueryClient();
    return useMutation(
      (itemId: UUID) => Api.addFavoriteItem(itemId, queryConfig),
      {
        onSuccess: () => {
          notifier?.({ type: addFavoriteItemRoutine.SUCCESS });
        },
        onError: (error: Error) => {
          notifier?.({
            type: addFavoriteItemRoutine.FAILURE,
            payload: { error },
          });
        },
        onSettled: () => {
          queryClient.invalidateQueries(memberKeys.current().favoriteItems);
        },
      },
    );
  };

  const useRemoveFavoriteItem = () => {
    const queryClient = useQueryClient();
    return useMutation(
      (itemId: UUID) => Api.removeFavoriteItem(itemId, queryConfig),
      {
        onSuccess: () => {
          notifier?.({ type: deleteFavoriteItemRoutine.SUCCESS });
        },
        onError: (error: Error) => {
          notifier?.({
            type: deleteFavoriteItemRoutine.FAILURE,
            payload: { error },
          });
        },
        onSettled: () => {
          queryClient.invalidateQueries(memberKeys.current().favoriteItems);
        },
      },
    );
  };

  return {
    useAddFavoriteItem,
    useRemoveFavoriteItem,
  };
};

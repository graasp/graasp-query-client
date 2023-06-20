import { useMutation, useQueryClient } from 'react-query';

import { UUID } from '@graasp/sdk';

import * as Api from '../api';
import { FAVORITE_ITEMS_KEY } from '../config/keys';
import { addFavoriteItemRoutine, deleteFavoriteItemRoutine } from '../routines';
import { QueryClientConfig } from '../types';

export default (queryConfig: QueryClientConfig) => {
  const { notifier } = queryConfig;

  const useAddFavoriteItem = () => {
    const queryClient = useQueryClient();
    return useMutation(
      (itemId: UUID) =>
        Api.addFavoriteItem(itemId, queryConfig),
      {
        onSuccess: () => {
          notifier?.({ type: addFavoriteItemRoutine.SUCCESS });
        },
        onError: (error: Error) => {
          notifier?.({ type: addFavoriteItemRoutine.FAILURE, payload: { error } });
        },
        onSettled: () => {
          queryClient.invalidateQueries(FAVORITE_ITEMS_KEY);
        },
      },
    );
  };

  const useRemoveFavoriteItem = () => {
    const queryClient = useQueryClient();
    return useMutation(
      (itemId: UUID) =>
        Api.removeFavoriteItem(itemId, queryConfig),
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
          queryClient.invalidateQueries(FAVORITE_ITEMS_KEY);
        },
      },
    );
  };

  return {
    useAddFavoriteItem,
    useRemoveFavoriteItem,
  };
};

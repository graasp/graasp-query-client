import { QueryClient, useMutation } from 'react-query';

import { UUID } from '@graasp/sdk';

import * as Api from '../api';
import { FAVORITE_ITEMS_KEY, MUTATION_KEYS } from '../config/keys';
import {
  addFavoriteItemRoutine,
  deleteFavoriteItemRoutine
} from '../routines';
import { QueryClientConfig } from '../types';

export default (queryClient: QueryClient, queryConfig: QueryClientConfig) => {
  const { notifier } = queryConfig;

  queryClient.setMutationDefaults(MUTATION_KEYS.FAVORITE_ITEM, {
    mutationFn: (itemId) => Api.favoriteItem(itemId, queryConfig),
    onSuccess: () => {
      notifier?.({ type: addFavoriteItemRoutine.SUCCESS });
    },
    onError: (error) => {
      notifier?.({ type: addFavoriteItemRoutine.FAILURE, payload: { error } });
    },
    onSettled: () => {
      queryClient.invalidateQueries(FAVORITE_ITEMS_KEY);
    },
  });
  const useFavoriteItem = () =>
    useMutation<void, unknown, UUID>(MUTATION_KEYS.FAVORITE_ITEM);

  queryClient.setMutationDefaults(MUTATION_KEYS.UNFAVORITE_ITEM, {
    mutationFn: (itemId) => Api.unfavoriteItem(itemId, queryConfig),
    onSuccess: () => {
      notifier?.({ type: deleteFavoriteItemRoutine.SUCCESS });
    },
    onError: (error) => {
      notifier?.({ type: deleteFavoriteItemRoutine.FAILURE, payload: { error } });
    },
    onSettled: () => {
      queryClient.invalidateQueries(FAVORITE_ITEMS_KEY);
    },
  });
  const useUnfavoriteItem = () =>
    useMutation<void, unknown, UUID>(MUTATION_KEYS.UNFAVORITE_ITEM);

  return {
    useFavoriteItem,
    useUnfavoriteItem
  };
};

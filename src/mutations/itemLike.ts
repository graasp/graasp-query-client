import { QueryClient } from 'react-query';

import * as Api from '../api';
import {
  MUTATION_KEYS,
  buildGetLikeCountKey,
  buildGetLikedItemsKey,
} from '../config/keys';
import { deleteItemLikeRoutine, postItemLikeRoutine } from '../routines';
import { QueryClientConfig } from '../types';

export default (queryClient: QueryClient, queryConfig: QueryClientConfig) => {
  const { notifier } = queryConfig;

  queryClient.setMutationDefaults(MUTATION_KEYS.POST_ITEM_LIKE, {
    mutationFn: ({ itemId }) => Api.postItemLike(itemId, queryConfig),
    onSuccess: () => {
      notifier?.({ type: postItemLikeRoutine.SUCCESS });
    },
    onError: (error) => {
      notifier?.({ type: postItemLikeRoutine.FAILURE, payload: { error } });
    },
    onSettled: (_data, _error, { itemId, memberId }) => {
      queryClient.invalidateQueries(buildGetLikedItemsKey(memberId));
      queryClient.invalidateQueries(buildGetLikeCountKey(itemId));
    },
  });

  queryClient.setMutationDefaults(MUTATION_KEYS.DELETE_ITEM_LIKE, {
    mutationFn: ({ id }) => Api.deleteItemLike(id, queryConfig),
    onSuccess: () => {
      notifier?.({ type: deleteItemLikeRoutine.SUCCESS });
    },
    onError: (error) => {
      notifier?.({
        type: deleteItemLikeRoutine.FAILURE,
        payload: { error },
      });
    },
    onSettled: (_data, _error, { itemId, memberId }) => {
      queryClient.invalidateQueries(buildGetLikedItemsKey(memberId));
      queryClient.invalidateQueries(buildGetLikeCountKey(itemId));
    },
  });
};

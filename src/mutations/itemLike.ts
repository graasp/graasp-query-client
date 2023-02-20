import { QueryClient, useMutation } from 'react-query';

import { UUID } from '@graasp/sdk';

import * as Api from '../api';
import {
  MUTATION_KEYS,
  buildGetLikeCountKey,
  buildGetLikedItemsKey,
} from '../config/keys';
import { deleteItemLikeRoutine, postItemLikeRoutine } from '../routines';
import { QueryClientConfig } from '../types';

const { POST_ITEM_LIKE, DELETE_ITEM_LIKE } = MUTATION_KEYS;

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
  const usePostItemLike = () =>
    useMutation<void, unknown, { itemId: UUID }>(POST_ITEM_LIKE);

  queryClient.setMutationDefaults(DELETE_ITEM_LIKE, {
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
  const useDeleteItemLike = () =>
    useMutation<void, unknown, { id: UUID }>(DELETE_ITEM_LIKE);

  return {
    usePostItemLike,
    useDeleteItemLike,
  };
};

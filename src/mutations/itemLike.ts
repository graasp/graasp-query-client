import { ItemLike, Member, UUID } from '@graasp/sdk';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import * as Api from '../api/itemLike.js';
import { itemKeys, memberKeys } from '../keys.js';
import {
  deleteItemLikeRoutine,
  postItemLikeRoutine,
} from '../routines/itemLike.js';
import { QueryClientConfig } from '../types.js';

export default (queryConfig: QueryClientConfig) => {
  const { notifier } = queryConfig;

  const usePostItemLike = () => {
    const queryClient = useQueryClient();
    return useMutation<
      ItemLike,
      Error,
      { itemId: UUID; memberId: Member['id'] }
    >({
      mutationFn: ({ itemId }) => Api.postItemLike(itemId, queryConfig),
      onSuccess: () => {
        notifier?.({ type: postItemLikeRoutine.SUCCESS });
      },
      onError: (error) => {
        notifier?.({ type: postItemLikeRoutine.FAILURE, payload: { error } });
      },
      onSettled: (_data, _error, { memberId, itemId }) => {
        queryClient.invalidateQueries({
          queryKey: memberKeys.single(memberId).likedItems,
        });
        queryClient.invalidateQueries({
          queryKey: itemKeys.single(itemId).likes,
        });
      },
    });
  };

  const useDeleteItemLike = () => {
    const queryClient = useQueryClient();
    return useMutation<
      ItemLike,
      Error,
      { itemId: UUID; memberId: Member['id'] }
    >({
      mutationFn: ({ itemId }) => Api.deleteItemLike(itemId, queryConfig),
      onSuccess: () => {
        notifier?.({ type: deleteItemLikeRoutine.SUCCESS });
      },
      onError: (error) => {
        notifier?.({
          type: deleteItemLikeRoutine.FAILURE,
          payload: { error },
        });
      },
      onSettled: (_data, _error, { memberId, itemId }) => {
        queryClient.invalidateQueries({
          queryKey: memberKeys.single(memberId).likedItems,
        });
        queryClient.invalidateQueries({
          queryKey: itemKeys.single(itemId).likes,
        });
      },
    });
  };

  return {
    usePostItemLike,
    useDeleteItemLike,
  };
};

import { QueryClient, useMutation, useQueryClient } from 'react-query';

import { ItemLike, UUID } from '@graasp/sdk';

import * as Api from '../api';
import { buildGetLikesForMemberKey } from '../config/keys';
import { deleteItemLikeRoutine, postItemLikeRoutine } from '../routines';
import { QueryClientConfig } from '../types';

export default (_queryClient: QueryClient, queryConfig: QueryClientConfig) => {
  const { notifier } = queryConfig;

  const usePostItemLike = () => {
    const queryClient = useQueryClient();
    return useMutation<ItemLike, Error, { itemId: UUID }>(
      ({ itemId }) => Api.postItemLike(itemId, queryConfig),
      {
        onSuccess: () => {
          notifier?.({ type: postItemLikeRoutine.SUCCESS });
        },
        onError: (error) => {
          notifier?.({ type: postItemLikeRoutine.FAILURE, payload: { error } });
        },
        onSettled: (data, _error) => {
          queryClient.invalidateQueries(
            buildGetLikesForMemberKey(data?.creator.id),
          );
        },
      },
    );
  };

  const useDeleteItemLike = () => {
    const queryClient = useQueryClient();
    return useMutation<ItemLike, Error, { itemId: UUID }>(
      ({ itemId }) => Api.deleteItemLike(itemId, queryConfig),
      {
        onSuccess: () => {
          notifier?.({ type: deleteItemLikeRoutine.SUCCESS });
        },
        onError: (error) => {
          notifier?.({
            type: deleteItemLikeRoutine.FAILURE,
            payload: { error },
          });
        },
        onSettled: (data, _error) => {
          queryClient.invalidateQueries(
            buildGetLikesForMemberKey(data?.creator.id),
          );
        },
      },
    );
  };

  return {
    usePostItemLike,
    useDeleteItemLike,
  };
};

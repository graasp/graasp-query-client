import { ItemLike, Member, UUID } from '@graasp/sdk';

import { useMutation, useQueryClient } from 'react-query';

import * as Api from '../api';
import {
  buildGetLikesForItem,
  buildGetLikesForMemberKey,
} from '../config/keys';
import { deleteItemLikeRoutine, postItemLikeRoutine } from '../routines';
import { QueryClientConfig } from '../types';

export default (queryConfig: QueryClientConfig) => {
  const { notifier } = queryConfig;

  const usePostItemLike = () => {
    const queryClient = useQueryClient();
    return useMutation<
      ItemLike,
      Error,
      { itemId: UUID; memberId: Member['id'] }
    >(({ itemId }) => Api.postItemLike(itemId, queryConfig), {
      onSuccess: () => {
        notifier?.({ type: postItemLikeRoutine.SUCCESS });
      },
      onError: (error) => {
        notifier?.({ type: postItemLikeRoutine.FAILURE, payload: { error } });
      },
      onSettled: (_data, _error, { memberId, itemId }) => {
        queryClient.invalidateQueries(buildGetLikesForMemberKey(memberId));
        queryClient.invalidateQueries(buildGetLikesForItem(itemId));
      },
    });
  };

  const useDeleteItemLike = () => {
    const queryClient = useQueryClient();
    return useMutation<
      ItemLike,
      Error,
      { itemId: UUID; memberId: Member['id'] }
    >(({ itemId }) => Api.deleteItemLike(itemId, queryConfig), {
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
        queryClient.invalidateQueries(buildGetLikesForMemberKey(memberId));
        queryClient.invalidateQueries(buildGetLikesForItem(itemId));
      },
    });
  };

  return {
    usePostItemLike,
    useDeleteItemLike,
  };
};

import {
  ItemVisibility,
  ItemVisibilityType,
  UUID,
  getParentFromPath,
} from '@graasp/sdk';
import { SUCCESS_MESSAGES } from '@graasp/translations';

import {
  QueryClient,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import * as Api from '../api/itemVisibility.js';
import { getKeyForParentId, itemKeys } from '../keys.js';
import {
  deleteItemVisibilityRoutine,
  postItemVisibilityRoutine,
} from '../routines/itemVisibility.js';
import { QueryClientConfig } from '../types.js';

export default (queryConfig: QueryClientConfig) => {
  const { notifier } = queryConfig;

  const invalidateQueries = (
    queryClient: QueryClient,
    itemId: UUID,
    data: ItemVisibility | undefined,
  ) => {
    // because with had PackedItem now, we need to invalidate the whole item key
    queryClient.invalidateQueries({
      queryKey: itemKeys.single(itemId).content,
    });
    // because with use PackedItem, we also have to invalidate parent item for tables
    const parentPath = data?.item
      ? getParentFromPath(data.item.path)
      : undefined;
    const parentKey = getKeyForParentId(parentPath);

    queryClient.invalidateQueries({ queryKey: parentKey });
  };

  const usePostItemVisibility = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (payload: {
        creator?: UUID;
        itemId: UUID;
        type: ItemVisibilityType;
      }) => Api.postItemVisibility(payload, queryConfig),
      onSuccess: () => {
        notifier?.({
          type: postItemVisibilityRoutine.SUCCESS,
          payload: { message: SUCCESS_MESSAGES.POST_ITEM_VISIBILITY },
        });
      },
      onError: (error: Error) => {
        notifier?.({
          type: postItemVisibilityRoutine.FAILURE,
          payload: { error },
        });
      },
      onSettled: (data, _error, { itemId }) => {
        invalidateQueries(queryClient, itemId, data);
      },
    });
  };

  const useDeleteItemVisibility = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (payload: { itemId: UUID; type: ItemVisibility['type'] }) =>
        Api.deleteItemVisibility(payload, queryConfig),
      onMutate: async ({ itemId, type }) => {
        const itemVisibilityKey = itemKeys.single(itemId).visibilities;
        await queryClient.cancelQueries({ queryKey: itemVisibilityKey });

        // Snapshot the previous value
        const prevValue =
          queryClient.getQueryData<ItemVisibility[]>(itemVisibilityKey);

        // remove visibility from list
        if (prevValue) {
          queryClient.setQueryData(
            itemVisibilityKey,
            prevValue.filter(({ type: ttype }) => ttype !== type),
          );
        }
        return { itemVisibilities: prevValue };
      },
      onSuccess: () => {
        notifier?.({
          type: deleteItemVisibilityRoutine.SUCCESS,
          payload: { message: SUCCESS_MESSAGES.DELETE_ITEM_VISIBILITY },
        });
      },
      onError: (error: Error, { itemId }, context) => {
        const itemKey = itemKeys.single(itemId).visibilities;
        queryClient.setQueryData(itemKey, context?.itemVisibilities);
        notifier?.({
          type: deleteItemVisibilityRoutine.FAILURE,
          payload: { error },
        });
      },
      onSettled: (data, _error, { itemId }) => {
        invalidateQueries(queryClient, itemId, data);
      },
    });
  };

  return {
    usePostItemVisibility,
    useDeleteItemVisibility,
  };
};

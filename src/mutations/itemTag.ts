import { ItemTag, ItemTagType, UUID, getParentFromPath } from '@graasp/sdk';
import { SUCCESS_MESSAGES } from '@graasp/translations';

import {
  QueryClient,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import * as Api from '../api/itemTag.js';
import { getKeyForParentId, itemKeys } from '../keys.js';
import {
  deleteItemTagRoutine,
  postItemTagRoutine,
} from '../routines/itemTag.js';
import { QueryClientConfig } from '../types.js';

export default (queryConfig: QueryClientConfig) => {
  const { notifier } = queryConfig;

  const invalidateQueries = (
    queryClient: QueryClient,
    itemId: UUID,
    // TODO: ItemTag doesn't correspond anymore with what the backend send
    data: ItemTag | undefined,
  ) => {
    // because with had PackItem now, we need to invalidate the whole item key
    queryClient.invalidateQueries(itemKeys.single(itemId).content);
    // because with use PackedItem, we also have to invalidate parent item for tables
    const parentPath = data?.item
      ? getParentFromPath(data.item.path)
      : undefined;
    const parentKey = getKeyForParentId(parentPath);

    queryClient.invalidateQueries(parentKey);
  };

  const usePostItemTag = () => {
    const queryClient = useQueryClient();
    return useMutation(
      (payload: { creator?: UUID; itemId: UUID; type: ItemTagType }) =>
        Api.postItemTag(payload, queryConfig),
      {
        onSuccess: () => {
          notifier?.({
            type: postItemTagRoutine.SUCCESS,
            payload: { message: SUCCESS_MESSAGES.POST_ITEM_TAG },
          });
        },
        onError: (error: Error) => {
          notifier?.({ type: postItemTagRoutine.FAILURE, payload: { error } });
        },
        onSettled: (data, _error, { itemId }) => {
          invalidateQueries(queryClient, itemId, data);
        },
      },
    );
  };

  const useDeleteItemTag = () => {
    const queryClient = useQueryClient();
    return useMutation(
      (payload: { itemId: UUID; type: `${ItemTagType}` | ItemTagType }) =>
        Api.deleteItemTag(payload, queryConfig),
      {
        onMutate: async ({ itemId, type }) => {
          const itemTagKey = itemKeys.single(itemId).tags;
          await queryClient.cancelQueries(itemTagKey);

          // Snapshot the previous value
          const prevValue = queryClient.getQueryData<ItemTag[]>(itemTagKey);

          // remove tag from list
          if (prevValue) {
            queryClient.setQueryData(
              itemTagKey,
              prevValue.filter(({ type: ttype }) => ttype !== type),
            );
          }
          return { itemTags: prevValue };
        },
        onSuccess: () => {
          notifier?.({
            type: deleteItemTagRoutine.SUCCESS,
            payload: { message: SUCCESS_MESSAGES.DELETE_ITEM_TAG },
          });
        },
        onError: (error: Error, { itemId }, context) => {
          const itemKey = itemKeys.single(itemId).tags;
          queryClient.setQueryData(itemKey, context?.itemTags);
          notifier?.({
            type: deleteItemTagRoutine.FAILURE,
            payload: { error },
          });
        },
        onSettled: (data, _error, { itemId }) => {
          invalidateQueries(queryClient, itemId, data);
        },
      },
    );
  };

  return {
    usePostItemTag,
    useDeleteItemTag,
  };
};

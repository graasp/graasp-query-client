import { ItemTag, ItemTagType, UUID } from '@graasp/sdk';
import { SUCCESS_MESSAGES } from '@graasp/translations';

import { useMutation, useQueryClient } from 'react-query';

import * as Api from '../api/itemTag.js';
import { itemKeys } from '../config/keys.js';
import {
  deleteItemTagRoutine,
  postItemTagRoutine,
} from '../routines/itemTag.js';
import { QueryClientConfig } from '../types.js';

export default (queryConfig: QueryClientConfig) => {
  const { notifier } = queryConfig;

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
          // the following was needed in the builder
          // probably because queryClient is not the same as the one we use higher in the scope
          // await queryClient.invalidateQueries(DATA_KEYS.itemTagsKeys.many());
        },
        onError: (error: Error) => {
          notifier?.({ type: postItemTagRoutine.FAILURE, payload: { error } });
        },
        onSettled: (_data, _error, { itemId }) => {
          queryClient.invalidateQueries(itemKeys.single(itemId).tags);
          // invalidate any "many" query targeting item tags
          queryClient.invalidateQueries(itemKeys.allMany());
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
          // the following was needed in the builder
          // probably because queryClient is not the same as the one we use higher in the scope
          // await queryClient.invalidateQueries(DATA_KEYS.itemTagsKeys.many());
        },
        onError: (error: Error, { itemId }, context) => {
          const itemKey = itemKeys.single(itemId).tags;
          queryClient.setQueryData(itemKey, context?.itemTags);
          notifier?.({
            type: deleteItemTagRoutine.FAILURE,
            payload: { error },
          });
        },
        onSettled: (_data, _error, { itemId }) => {
          queryClient.invalidateQueries(itemKeys.single(itemId).tags);
          // invalidate any "many" query that contains the id we modified
          queryClient.invalidateQueries(itemKeys.allMany());
        },
      },
    );
  };

  return {
    usePostItemTag,
    useDeleteItemTag,
  };
};

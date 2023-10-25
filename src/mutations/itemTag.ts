import { ItemTag, ItemTagType, UUID } from '@graasp/sdk';
import { SUCCESS_MESSAGES } from '@graasp/translations';

import { useMutation, useQueryClient } from 'react-query';

import * as Api from '../api';
import { itemTagsKeys } from '../config/keys';
import { deleteItemTagRoutine, postItemTagRoutine } from '../routines';
import { QueryClientConfig } from '../types';

export default (queryConfig: QueryClientConfig) => {
  const { notifier } = queryConfig;

  const usePostItemTag = () => {
    const queryClient = useQueryClient();
    return useMutation<
      void,
      Error,
      { type: ItemTagType; itemId: string; creator?: UUID }
    >(
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
        onError: (error) => {
          notifier?.({ type: postItemTagRoutine.FAILURE, payload: { error } });
        },
        onSettled: (_data, _error, { itemId }) => {
          queryClient.invalidateQueries(itemTagsKeys.singleId(itemId));
          // invalidate any "many" query targeting item tags
          queryClient.invalidateQueries(itemTagsKeys.many());
        },
      },
    );
  };

  const useDeleteItemTag = () => {
    const queryClient = useQueryClient();
    return useMutation<
      void,
      Error,
      { itemId: UUID; type: `${ItemTagType}` | ItemTagType },
      { itemTags?: ItemTag[] }
    >((payload) => Api.deleteItemTag(payload, queryConfig), {
      onMutate: async ({ itemId, type }) => {
        const itemTagKey = itemTagsKeys.singleId(itemId);
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
      onError: (error, { itemId }, context) => {
        const itemKey = itemTagsKeys.singleId(itemId);
        queryClient.setQueryData(itemKey, context?.itemTags);
        notifier?.({ type: deleteItemTagRoutine.FAILURE, payload: { error } });
      },
      onSettled: (_data, _error, { itemId }) => {
        queryClient.invalidateQueries(itemTagsKeys.singleId(itemId));
        // invalidate any "many" query that contains the id we modified
        queryClient.invalidateQueries(itemTagsKeys.many());
      },
    });
  };

  return {
    usePostItemTag,
    useDeleteItemTag,
  };
};

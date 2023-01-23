import { List } from 'immutable';
import { QueryClient, useMutation } from 'react-query';

import { ItemTagType, UUID } from '@graasp/sdk';
import { ItemTagRecord } from '@graasp/sdk/frontend';
import { SUCCESS_MESSAGES } from '@graasp/translations';

import * as Api from '../api';
import { MUTATION_KEYS, itemTagsKeys } from '../config/keys';
import { deleteItemTagRoutine, postItemTagRoutine } from '../routines';
import { QueryClientConfig } from '../types';

const { POST_ITEM_TAG, DELETE_ITEM_TAG } = MUTATION_KEYS;

export default (queryClient: QueryClient, queryConfig: QueryClientConfig) => {
  const { notifier } = queryConfig;

  queryClient.setMutationDefaults(POST_ITEM_TAG, {
    mutationFn: (payload: {
      creator?: UUID;
      itemId: UUID;
      type: ItemTagType;
    }) => Api.postItemTag(payload, queryConfig),
    onSuccess: () => {
      notifier?.({
        type: postItemTagRoutine.SUCCESS,
        payload: { message: SUCCESS_MESSAGES.POST_ITEM_TAG },
      });
    },
    onError: (error) => {
      notifier?.({ type: postItemTagRoutine.FAILURE, payload: { error } });
    },
    onSettled: (_data, _error, { id }) => {
      queryClient.invalidateQueries(itemTagsKeys.singleId(id));
      // invalidate any "many" query targeting item tags
      queryClient.invalidateQueries(itemTagsKeys.many());
    },
  });
  const usePostItemTag = () =>
    useMutation<
      void,
      unknown,
      { type: ItemTagType; itemId: string; creator?: UUID }
    >(POST_ITEM_TAG);

  queryClient.setMutationDefaults(DELETE_ITEM_TAG, {
    mutationFn: (payload) => Api.deleteItemTag(payload, queryConfig),
    onMutate: async ({ itemId, type }) => {
      const itemTagKey = itemTagsKeys.singleId(itemId);
      await queryClient.cancelQueries(itemTagKey);

      // Snapshot the previous value
      const prevValue =
        queryClient.getQueryData<List<ItemTagRecord>>(itemTagKey);

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
    onError: (error, { itemId }, context) => {
      const itemKey = itemTagsKeys.singleId(itemId);
      queryClient.setQueryData(itemKey, context.itemTags);
      notifier?.({ type: deleteItemTagRoutine.FAILURE, payload: { error } });
    },
    onSettled: (_data, _error, { itemId }) => {
      queryClient.invalidateQueries(itemTagsKeys.singleId(itemId));
      // invalidate any "many" query that contains the id we modified
      queryClient.invalidateQueries(itemTagsKeys.many());
    },
  });
  const useDeleteItemTag = () =>
    useMutation<void, unknown, { itemId: UUID; type: ItemTagType }>(
      DELETE_ITEM_TAG,
    );

  return {
    usePostItemTag,
    useDeleteItemTag,
  };
};

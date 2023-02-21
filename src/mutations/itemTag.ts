import { List } from 'immutable';
import { QueryClient, useMutation } from 'react-query';

import { UUID } from '@graasp/sdk';
import { ItemTagRecord } from '@graasp/sdk/frontend';
import { SUCCESS_MESSAGES } from '@graasp/translations';

import * as Api from '../api';
import { MUTATION_KEYS, buildItemTagsKey } from '../config/keys';
import { deleteItemTagRoutine, postItemTagRoutine } from '../routines';
import { QueryClientConfig } from '../types';

const { POST_ITEM_TAG, DELETE_ITEM_TAG } = MUTATION_KEYS;

export default (queryClient: QueryClient, queryConfig: QueryClientConfig) => {
  const { notifier } = queryConfig;

  queryClient.setMutationDefaults(POST_ITEM_TAG, {
    mutationFn: (payload) =>
      Api.postItemTag(payload, queryConfig).then(() => payload),
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
      queryClient.invalidateQueries(buildItemTagsKey(id));
    },
  });
  const usePostItemTag = () =>
    useMutation<
      void,
      unknown,
      { id: UUID; tagId: UUID; itemPath: string; creator: UUID }
    >(POST_ITEM_TAG);

  queryClient.setMutationDefaults(DELETE_ITEM_TAG, {
    mutationFn: (payload) =>
      Api.deleteItemTag(payload, queryConfig).then(() => payload),
    onMutate: async ({ id, tagId }) => {
      const itemTagKey = buildItemTagsKey(id);
      await queryClient.cancelQueries(itemTagKey);

      // Snapshot the previous value
      const prevValue =
        queryClient.getQueryData<List<ItemTagRecord>>(itemTagKey);

      // remove tag from list
      if (prevValue) {
        queryClient.setQueryData(
          itemTagKey,
          prevValue.filter(({ id: tId }) => tId !== tagId),
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
    onError: (error, { id }, context) => {
      const itemKey = buildItemTagsKey(id);
      queryClient.setQueryData(itemKey, context.itemTags);
      notifier?.({ type: deleteItemTagRoutine.FAILURE, payload: { error } });
    },
    onSettled: (_data, _error, { id }) => {
      queryClient.invalidateQueries(buildItemTagsKey(id));
    },
  });
  const useDeleteItemTag = () =>
    useMutation<void, unknown, { id: UUID; tagId: UUID }>(DELETE_ITEM_TAG);

  return {
    usePostItemTag,
    useDeleteItemTag,
  };
};

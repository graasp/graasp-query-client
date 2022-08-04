import { QueryClient } from 'react-query';
import { List } from 'immutable';
import { SUCCESS_MESSAGES } from '@graasp/translations';
import { buildItemTagsKey, MUTATION_KEYS } from '../config/keys';
import { deleteItemTagRoutine, postItemTagRoutine } from '../routines';
import * as Api from '../api';
import { ItemTagRecord, QueryClientConfig } from '../types';

export default (queryClient: QueryClient, queryConfig: QueryClientConfig) => {
  const { notifier } = queryConfig;

  queryClient.setMutationDefaults(MUTATION_KEYS.POST_ITEM_TAG, {
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

  queryClient.setMutationDefaults(MUTATION_KEYS.DELETE_ITEM_TAG, {
    mutationFn: (payload) =>
      Api.deleteItemTag(payload, queryConfig).then(() => payload),
    onMutate: async ({ id, tagId }) => {
      const itemTagKey = buildItemTagsKey(id);
      await queryClient.cancelQueries(itemTagKey);

      // Snapshot the previous value
      const prevValue = queryClient.getQueryData<List<ItemTagRecord>>(itemTagKey);

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
};

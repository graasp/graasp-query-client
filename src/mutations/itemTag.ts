import { QueryClient } from 'react-query';
import { List } from 'immutable';
import {
  buildItemTagsKey,
  DELETE_ITEM_TAG_MUTATION_KEY,
  POST_ITEM_TAG_MUTATION_KEY,
} from '../config/keys';
import { deleteItemTagRoutine, postItemTagRoutine } from '../routines';
import * as Api from '../api';
import { ItemTag, QueryClientConfig } from '../types';

export default (queryClient: QueryClient, queryConfig: QueryClientConfig) => {
  const { notifier } = queryConfig;

  queryClient.setMutationDefaults(POST_ITEM_TAG_MUTATION_KEY, {
    mutationFn: (payload) =>
      Api.postItemTag(payload, queryConfig).then(() => payload),
    onSuccess: () => {
      notifier?.({ type: postItemTagRoutine.SUCCESS });
    },
    onError: (error) => {
      notifier?.({ type: postItemTagRoutine.FAILURE, payload: { error } });
    },
    onSettled: ({ id }) => {
      queryClient.invalidateQueries(buildItemTagsKey(id));
    },
  });

  queryClient.setMutationDefaults(DELETE_ITEM_TAG_MUTATION_KEY, {
    mutationFn: (payload) =>
      Api.deleteItemTag(payload, queryConfig).then(() => payload),
    onMutate: async ({ id, tagId }) => {
      const itemTagKey = buildItemTagsKey(id);
      await queryClient.cancelQueries(itemTagKey);

      // Snapshot the previous value
      const prevValue = queryClient.getQueryData(itemTagKey);

      queryClient.setQueryData(itemTagKey, (old) => {
        const oldTags = (old as any) as List<ItemTag>;
        oldTags.filter(({ id: tId }) => tId !== tagId);
      });
      return prevValue;
    },
    onSuccess: () => {
      notifier?.({ type: deleteItemTagRoutine.SUCCESS });
    },
    onError: (error, { id }, context) => {
      const itemKey = buildItemTagsKey(id);
      queryClient.setQueryData(itemKey, context.prevValue);
      notifier?.({ type: deleteItemTagRoutine.FAILURE, payload: { error } });
    },
    onSettled: ({ id }) => {
      queryClient.invalidateQueries(buildItemTagsKey(id));
    },
  });
};

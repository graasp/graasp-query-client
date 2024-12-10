import { DiscriminatedItem, Tag } from '@graasp/sdk';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { itemKeys } from '../../keys.js';
import { QueryClientConfig } from '../../types.js';
import { addTag, removeTag } from './api.js';
import { addTagRoutine, removeTagRoutine } from './routines.js';

export default (queryConfig: QueryClientConfig) => {
  const { notifier } = queryConfig;

  const useAddTag = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (args: {
        itemId: DiscriminatedItem['id'];
        tag: Pick<Tag, 'category' | 'name'>;
      }) => addTag(args, queryConfig),
      onSuccess: () => {
        notifier?.({
          type: addTagRoutine.SUCCESS,
        });
      },
      onError: (error: Error, _args, _context) => {
        notifier?.({
          type: addTagRoutine.FAILURE,
          payload: { error },
        });
      },
      onSettled: (_d, _e, { itemId }) => {
        queryClient.invalidateQueries({
          queryKey: itemKeys.single(itemId).tags,
        });
      },
    });
  };

  const useRemoveTag = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (args: {
        itemId: DiscriminatedItem['id'];
        tagId: Tag['id'];
      }) => removeTag(args, queryConfig),
      onSuccess: () => {
        notifier?.({
          type: removeTagRoutine.SUCCESS,
        });
      },
      onError: (error: Error, _args, _context) => {
        notifier?.({
          type: removeTagRoutine.FAILURE,
          payload: { error },
        });
      },
      onSettled: (_d, _e, { itemId }) => {
        queryClient.invalidateQueries({
          queryKey: itemKeys.single(itemId).tags,
        });
      },
    });
  };

  return { useAddTag, useRemoveTag };
};

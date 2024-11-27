import { DiscriminatedItem, Tag } from '@graasp/sdk';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { itemKeys } from '../../keys.js';
import { QueryClientConfig } from '../../types.js';
import { addTag, removeTag } from './api.js';
import { addTagRoutine, removeTagRoutine } from './routines.js';

export default (queryConfig: QueryClientConfig) => {
  const { notifier } = queryConfig;

  const useAddTag = (args: {
    itemId: DiscriminatedItem['id'];
    tagName: Tag['name'];
  }) => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: () => addTag(args, queryConfig),
      onSuccess: () => {
        notifier?.({
          type: addTagRoutine.SUCCESS,
        });

        queryClient.resetQueries();
      },
      onError: (error: Error, _args, _context) => {
        notifier?.({
          type: addTagRoutine.FAILURE,
          payload: { error },
        });
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: itemKeys.single(args.itemId).tags,
        });
      },
    });
  };

  const useRemoveTag = (args: {
    itemId: DiscriminatedItem['id'];
    tagName: Tag['name'];
  }) => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: () => removeTag(args, queryConfig),
      onSuccess: () => {
        notifier?.({
          type: removeTagRoutine.SUCCESS,
        });

        queryClient.resetQueries();
      },
      onError: (error: Error, _args, _context) => {
        notifier?.({
          type: removeTagRoutine.FAILURE,
          payload: { error },
        });
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: itemKeys.single(args.itemId).tags,
        });
      },
    });
  };

  return { useAddTag, useRemoveTag };
};

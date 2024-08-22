import { UUID } from '@graasp/sdk';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import * as Api from '../api/mention.js';
import { buildMentionKey } from '../keys.js';
import {
  clearMentionsRoutine,
  deleteMentionRoutine,
  patchMentionRoutine,
} from '../routines/index.js';
import { QueryClientConfig } from '../types.js';

export default (queryConfig: QueryClientConfig) => {
  const usePatchMention = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (args: { id: UUID; memberId: UUID; status: string }) =>
        Api.patchMemberMentionsStatus(args, queryConfig),
      onError: (error: Error) => {
        queryConfig.notifier?.({
          type: patchMentionRoutine.FAILURE,
          payload: { error },
        });
      },
      onSettled: (_data, _error) => {
        // invalidate keys only if websockets are disabled
        // otherwise the cache is updated automatically
        if (!queryConfig.enableWebsocket) {
          queryClient.invalidateQueries({ queryKey: buildMentionKey() });
        }
      },
    });
  };

  const useDeleteMention = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (mentionId: UUID) =>
        Api.deleteMention(mentionId, queryConfig),
      onError: (error: Error) => {
        queryConfig.notifier?.({
          type: deleteMentionRoutine.FAILURE,
          payload: { error },
        });
      },
      onSettled: (_data, _error) => {
        // invalidate keys only if websockets are disabled
        // otherwise the cache is updated automatically
        if (!queryConfig.enableWebsocket) {
          queryClient.invalidateQueries({ queryKey: buildMentionKey() });
        }
      },
    });
  };

  const useClearMentions = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: () => Api.clearMentions(queryConfig),
      onError: (error: Error) => {
        queryConfig.notifier?.({
          type: clearMentionsRoutine.FAILURE,
          payload: { error },
        });
      },
      onSettled: (_data, _error) => {
        // invalidate keys only if websockets are disabled
        // otherwise the cache is updated automatically
        if (!queryConfig.enableWebsocket) {
          queryClient.invalidateQueries({ queryKey: buildMentionKey() });
        }
      },
    });
  };

  return {
    useClearMentions,
    useDeleteMention,
    usePatchMention,
  };
};

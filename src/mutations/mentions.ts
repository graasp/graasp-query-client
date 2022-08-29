import { QueryClient } from 'react-query';
import * as Api from '../api';
import { buildMentionKey, MUTATION_KEYS } from '../config/keys';
import {
  clearMentionsRoutine,
  deleteMentionRoutine,
  patchMentionRoutine,
} from '../routines';
import { QueryClientConfig } from '../types';

const { PATCH_MENTION, DELETE_MENTION, CLEAR_MENTIONS } = MUTATION_KEYS;

export default (queryClient: QueryClient, queryConfig: QueryClientConfig) => {
  queryClient.setMutationDefaults(PATCH_MENTION, {
    mutationFn: (args: { id: string; memberId: string; status: string }) =>
      Api.patchMemberMentionsStatus(args, queryConfig),
    onError: (error) => {
      queryConfig.notifier?.({
        type: patchMentionRoutine.FAILURE,
        payload: { error },
      });
    },
    onSettled: (_data, _error, { memberId }) => {
      // invalidate keys only if websockets are disabled
      // otherwise the cache is updated automatically
      if (!queryConfig.enableWebsocket) {
        queryClient.invalidateQueries(buildMentionKey(memberId));
      }
    },
  });

  queryClient.setMutationDefaults(DELETE_MENTION, {
    mutationFn: (mentionId) => Api.deleteMention(mentionId, queryConfig),
    onError: (error) => {
      queryConfig.notifier?.({
        type: deleteMentionRoutine.FAILURE,
        payload: { error },
      });
    },
    onSettled: (_data, _error, { memberId }) => {
      // invalidate keys only if websockets are disabled
      // otherwise the cache is updated automatically
      if (!queryConfig.enableWebsocket) {
        queryClient.invalidateQueries(buildMentionKey(memberId));
      }
    },
  });

  queryClient.setMutationDefaults(CLEAR_MENTIONS, {
    mutationFn: () => Api.clearMentions(queryConfig),
    onError: (error) => {
      queryConfig.notifier?.({
        type: clearMentionsRoutine.FAILURE,
        payload: { error },
      });
    },
    onSettled: (_data, _error, { memberId }) => {
      // invalidate keys only if websockets are disabled
      // otherwise the cache is updated automatically
      if (!queryConfig.enableWebsocket) {
        queryClient.invalidateQueries(buildMentionKey(memberId));
      }
    },
  });
};

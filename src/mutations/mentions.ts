import { QueryClient } from 'react-query';
import * as Api from '../api';
import { buildMentionKey, MUTATION_KEYS } from '../config/keys';
import {
  patchMentionRoutine,
  deleteMentionRoutine,
  clearMentionsRoutine,
} from '../routines';
import { QueryClientConfig } from '../types';

const { PATCH_MENTION, DELETE_MENTION, CLEAR_MENTIONS } = MUTATION_KEYS;

export default (queryClient: QueryClient, queryConfig: QueryClientConfig) => {
  queryClient.setMutationDefaults(PATCH_MENTION, {
    mutationFn: (partialMention) =>
      Api.patchMemberMentionsStatus(partialMention, queryConfig),
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
    mutationFn: (mentionId) => Api.clearItemChat(mentionId, queryConfig),
    onError: (error) => {
      queryConfig.notifier?.({
        type: clearMentionsRoutine.FAILURE,
        payload: { error },
      });
    },
    onSettled: (_data, _error, mentionId) => {
      // invalidate keys only if websockets are disabled
      // otherwise the cache is updated automatically
      if (!queryConfig.enableWebsocket) {
        queryClient.invalidateQueries(buildMentionKey(mentionId));
      }
    },
  });
};

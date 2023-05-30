import { QueryClient, useMutation } from 'react-query';

import { UUID } from '@graasp/sdk';

import * as Api from '../api/index';
import { MUTATION_KEYS, buildMentionKey } from '../config/keys';
import {
  clearMentionsRoutine,
  deleteMentionRoutine,
  patchMentionRoutine,
} from '../routines/index';
import { QueryClientConfig } from '../types';

const { PATCH_MENTION, DELETE_MENTION, CLEAR_MENTIONS } = MUTATION_KEYS;

export default (queryClient: QueryClient, queryConfig: QueryClientConfig) => {
  queryClient.setMutationDefaults(PATCH_MENTION, {
    mutationFn: (args: { id: UUID; memberId: UUID; status: string }) =>
      Api.patchMemberMentionsStatus(args, queryConfig),
    onError: (error) => {
      queryConfig.notifier?.({
        type: patchMentionRoutine.FAILURE,
        payload: { error },
      });
    },
    onSettled: (_data, _error) => {
      // invalidate keys only if websockets are disabled
      // otherwise the cache is updated automatically
      if (!queryConfig.enableWebsocket) {
        queryClient.invalidateQueries(buildMentionKey());
      }
    },
  });
  const usePatchMention = () =>
    useMutation<void, unknown, { id: UUID; memberId: UUID; status: string }>(
      PATCH_MENTION,
    );

  queryClient.setMutationDefaults(DELETE_MENTION, {
    mutationFn: (mentionId) => Api.deleteMention(mentionId, queryConfig),
    onError: (error) => {
      queryConfig.notifier?.({
        type: deleteMentionRoutine.FAILURE,
        payload: { error },
      });
    },
    onSettled: (_data, _error) => {
      // invalidate keys only if websockets are disabled
      // otherwise the cache is updated automatically
      if (!queryConfig.enableWebsocket) {
        queryClient.invalidateQueries(buildMentionKey());
      }
    },
  });
  const useDeleteMention = () =>
    useMutation<void, unknown, UUID>(DELETE_MENTION);

  queryClient.setMutationDefaults(CLEAR_MENTIONS, {
    mutationFn: () => Api.clearMentions(queryConfig),
    onError: (error) => {
      queryConfig.notifier?.({
        type: clearMentionsRoutine.FAILURE,
        payload: { error },
      });
    },
    onSettled: (_data, _error) => {
      // invalidate keys only if websockets are disabled
      // otherwise the cache is updated automatically
      if (!queryConfig.enableWebsocket) {
        queryClient.invalidateQueries(buildMentionKey());
      }
    },
  });
  const useClearMentions = () =>
    useMutation<void, unknown, void>(CLEAR_MENTIONS);
  return {
    useClearMentions,
    useDeleteMention,
    usePatchMention,
  };
};

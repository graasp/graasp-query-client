import {
  DeleteChatMessageParamType,
  PatchChatMessageParamType,
  PostChatMessageParamType,
  UUID,
} from '@graasp/sdk';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import * as Api from '../api/chat.js';
import { buildItemChatKey } from '../keys.js';
import {
  clearItemChatRoutine,
  deleteItemChatMessageRoutine,
  patchItemChatMessageRoutine,
  postItemChatMessageRoutine,
} from '../routines/chat.js';
import { QueryClientConfig } from '../types.js';

export default (queryConfig: QueryClientConfig) => {
  const usePostItemChatMessage = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (chatMsg: PostChatMessageParamType) =>
        Api.postItemChatMessage(chatMsg, queryConfig),
      onError: (error: Error) => {
        queryConfig.notifier?.({
          type: postItemChatMessageRoutine.FAILURE,
          payload: { error },
        });
      },
      onSettled: (_data, _error, { itemId }) => {
        // invalidate keys only if websockets are disabled
        // otherwise the cache is updated automatically
        if (!queryConfig.enableWebsocket) {
          queryClient.invalidateQueries({ queryKey: buildItemChatKey(itemId) });
        }
      },
    });
  };
  const usePatchItemChatMessage = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (chatMsg: PatchChatMessageParamType) =>
        Api.patchItemChatMessage(chatMsg, queryConfig),
      onError: (error: Error) => {
        queryConfig.notifier?.({
          type: patchItemChatMessageRoutine.FAILURE,
          payload: { error },
        });
      },
      onSettled: (_data, _error, { itemId }) => {
        // invalidate keys only if websockets are disabled
        // otherwise the cache is updated automatically
        if (!queryConfig.enableWebsocket) {
          queryClient.invalidateQueries({ queryKey: buildItemChatKey(itemId) });
        }
      },
    });
  };

  const useDeleteItemChatMessage = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (chatMsg: DeleteChatMessageParamType) =>
        Api.deleteItemChatMessage(chatMsg, queryConfig),
      onError: (error: Error) => {
        queryConfig.notifier?.({
          type: deleteItemChatMessageRoutine.FAILURE,
          payload: { error },
        });
      },
      onSettled: (_data, _error, { itemId }) => {
        // invalidate keys only if websockets are disabled
        // otherwise the cache is updated automatically
        if (!queryConfig.enableWebsocket) {
          queryClient.invalidateQueries({ queryKey: buildItemChatKey(itemId) });
        }
      },
    });
  };

  const useClearItemChat = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (chatId: UUID) => Api.clearItemChat(chatId, queryConfig),
      onError: (error: Error) => {
        queryConfig.notifier?.({
          type: clearItemChatRoutine.FAILURE,
          payload: { error },
        });
      },
      onSettled: (_data, _error, chatId) => {
        // invalidate keys only if websockets are disabled
        // otherwise the cache is updated automatically
        if (!queryConfig.enableWebsocket) {
          queryClient.invalidateQueries({ queryKey: buildItemChatKey(chatId) });
        }
      },
    });
  };

  return {
    useClearItemChat,
    useDeleteItemChatMessage,
    usePatchItemChatMessage,
    usePostItemChatMessage,
  };
};

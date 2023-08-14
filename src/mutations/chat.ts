import {
  DeleteChatMessageParamType,
  PatchChatMessageParamType,
  PostChatMessageParamType,
  UUID,
} from '@graasp/sdk';

import { useMutation, useQueryClient } from 'react-query';

import * as Api from '../api';
import { buildItemChatKey } from '../config/keys';
import {
  clearItemChatRoutine,
  deleteItemChatMessageRoutine,
  patchItemChatMessageRoutine,
  postItemChatMessageRoutine,
} from '../routines';
import { QueryClientConfig } from '../types';

export default (queryConfig: QueryClientConfig) => {
  const usePostItemChatMessage = () => {
    const queryClient = useQueryClient();
    return useMutation(
      (chatMsg: PostChatMessageParamType) =>
        Api.postItemChatMessage(chatMsg, queryConfig),
      {
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
            queryClient.invalidateQueries(buildItemChatKey(itemId));
          }
        },
      },
    );
  };
  const usePatchItemChatMessage = () => {
    const queryClient = useQueryClient();
    return useMutation(
      (chatMsg: PatchChatMessageParamType) =>
        Api.patchItemChatMessage(chatMsg, queryConfig),
      {
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
            queryClient.invalidateQueries(buildItemChatKey(itemId));
          }
        },
      },
    );
  };

  const useDeleteItemChatMessage = () => {
    const queryClient = useQueryClient();
    return useMutation(
      (chatMsg: DeleteChatMessageParamType) =>
        Api.deleteItemChatMessage(chatMsg, queryConfig),
      {
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
            queryClient.invalidateQueries(buildItemChatKey(itemId));
          }
        },
      },
    );
  };

  const useClearItemChat = () => {
    const queryClient = useQueryClient();
    return useMutation(
      (chatId: UUID) => Api.clearItemChat(chatId, queryConfig),
      {
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
            queryClient.invalidateQueries(buildItemChatKey(chatId));
          }
        },
      },
    );
  };

  return {
    useClearItemChat,
    useDeleteItemChatMessage,
    usePatchItemChatMessage,
    usePostItemChatMessage,
  };
};

import { QueryClient, useMutation } from 'react-query';

import {
  DeleteChatMessageParamType,
  PatchChatMessageParamType,
  PostChatMessageParamType,
  UUID,
} from '@graasp/sdk';

import * as Api from '../api';
import { MUTATION_KEYS, buildItemChatKey } from '../config/keys';
import {
  clearItemChatRoutine,
  deleteItemChatMessageRoutine,
  patchItemChatMessageRoutine,
  postItemChatMessageRoutine,
} from '../routines';
import { QueryClientConfig } from '../types';

const {
  POST_ITEM_CHAT_MESSAGE,
  PATCH_ITEM_CHAT_MESSAGE,
  DELETE_ITEM_CHAT_MESSAGE,
  CLEAR_ITEM_CHAT,
} = MUTATION_KEYS;

export default (queryClient: QueryClient, queryConfig: QueryClientConfig) => {
  queryClient.setMutationDefaults(POST_ITEM_CHAT_MESSAGE, {
    mutationFn: (chatMsg) => Api.postItemChatMessage(chatMsg, queryConfig),
    onError: (error) => {
      queryConfig.notifier?.({
        type: postItemChatMessageRoutine.FAILURE,
        payload: { error },
      });
    },
    onSettled: (_data, _error, { chatId }) => {
      // invalidate keys only if websockets are disabled
      // otherwise the cache is updated automatically
      if (!queryConfig.enableWebsocket) {
        queryClient.invalidateQueries(buildItemChatKey(chatId));
      }
    },
  });
  const usePostItemChatMessage = () =>
    useMutation<void, unknown, PostChatMessageParamType>(
      POST_ITEM_CHAT_MESSAGE,
    );

  queryClient.setMutationDefaults(PATCH_ITEM_CHAT_MESSAGE, {
    mutationFn: (chatMsg) => Api.patchItemChatMessage(chatMsg, queryConfig),
    onError: (error) => {
      queryConfig.notifier?.({
        type: patchItemChatMessageRoutine.FAILURE,
        payload: { error },
      });
    },
    onSettled: (_data, _error, { chatId }) => {
      // invalidate keys only if websockets are disabled
      // otherwise the cache is updated automatically
      if (!queryConfig.enableWebsocket) {
        queryClient.invalidateQueries(buildItemChatKey(chatId));
      }
    },
  });
  const usePatchItemChatMessage = () =>
    useMutation<void, unknown, PatchChatMessageParamType>(
      PATCH_ITEM_CHAT_MESSAGE,
    );

  queryClient.setMutationDefaults(DELETE_ITEM_CHAT_MESSAGE, {
    mutationFn: (chatMsg) => Api.deleteItemChatMessage(chatMsg, queryConfig),
    onError: (error) => {
      queryConfig.notifier?.({
        type: deleteItemChatMessageRoutine.FAILURE,
        payload: { error },
      });
    },
    onSettled: (_data, _error, { chatId }) => {
      // invalidate keys only if websockets are disabled
      // otherwise the cache is updated automatically
      if (!queryConfig.enableWebsocket) {
        queryClient.invalidateQueries(buildItemChatKey(chatId));
      }
    },
  });
  const useDeleteItemChatMessage = () =>
    useMutation<void, unknown, DeleteChatMessageParamType>(
      DELETE_ITEM_CHAT_MESSAGE,
    );

  queryClient.setMutationDefaults(CLEAR_ITEM_CHAT, {
    mutationFn: (chatId) => Api.clearItemChat(chatId, queryConfig),
    onError: (error) => {
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
  });
  const useClearItemChat = () =>
    useMutation<void, unknown, UUID>(CLEAR_ITEM_CHAT);

  return {
    useClearItemChat,
    useDeleteItemChatMessage,
    usePatchItemChatMessage,
    usePostItemChatMessage,
  };
};

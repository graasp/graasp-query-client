/**
 * Graasp websocket client
 * React effect hooks to subscribe to real-time updates and mutate query client
 *
 * @author Alexandre CHAU
 */

import {
  WS_ENTITY_CHAT,
  WS_ENTITY_ITEM,
  WS_ENTITY_MEMBER,
  WS_SERVER_TYPE_UPDATE,
  WS_UPDATE_KIND_CHAT_ITEM,
  WS_UPDATE_KIND_CHILD_ITEM,
  WS_UPDATE_KIND_SHARED_WITH,
  WS_UPDATE_OP_CREATE,
  WS_UPDATE_OP_DELETE,
  WS_UPDATE_OP_PUBLISH,
} from '@graasp/websockets/src/interfaces/constants';
import { ServerMessage } from '@graasp/websockets/src/interfaces/message';
import { Chat } from '@graasp/plugin-chatbox/src/interfaces/chat';
import { List } from 'immutable';
import { useEffect } from 'react';
import { QueryClient } from 'react-query';
import {
  buildItemChatKey,
  buildItemChildrenKey,
  buildItemKey,
  SHARED_ITEMS_KEY,
} from '../config/keys';
import { isChatMessage, isItem, Item, UUID } from '../types';
import { Channel, GraaspWebsocketClient } from './ws-client';

export default (
  websocketClient: GraaspWebsocketClient,
  queryClient: QueryClient,
) => ({
  /**
   * React hook to subscribe to the children updates of the give parent item ID
   *
   * @param parentId The ID of the parent on which to observe children updates
   */
  useChildrenUpdates: (parentId: UUID) => {
    useEffect(() => {
      if (!parentId) {
        return;
      }

      const channel: Channel = { name: parentId, entity: WS_ENTITY_ITEM };
      const parentChildrenKey = buildItemChildrenKey(parentId);

      const handler = (data: ServerMessage) => {
        if (
          data.type === WS_SERVER_TYPE_UPDATE &&
          data.body.kind === WS_UPDATE_KIND_CHILD_ITEM &&
          data.body.entity === WS_ENTITY_ITEM
        ) {
          const current: List<Item> | undefined = queryClient.getQueryData(
            parentChildrenKey,
          );
          const value = data.body.value;
          if (!isItem(value)) {
            return;
          }
          let mutation;
          switch (data.body.op) {
            case WS_UPDATE_OP_CREATE: {
              if (current && !current.find((i) => i.id === value.id)) {
                mutation = current.push(value);
                queryClient.setQueryData(parentChildrenKey, mutation);
                queryClient.setQueryData(buildItemKey(value.id), value);
              }
              break;
            }
            case WS_UPDATE_OP_DELETE: {
              if (current) {
                mutation = current.filter((i) => i.id !== value.id);
                queryClient.setQueryData(parentChildrenKey, mutation);
              }
              break;
            }
          }
        }
      };

      websocketClient.subscribe(channel, handler);

      return function cleanup() {
        websocketClient.unsubscribe(channel, handler);
      };
    }, [parentId]);
  },

  useSharedItemsUpdates: (userId: UUID) => {
    useEffect(() => {
      if (!userId) {
        return;
      }

      const channel: Channel = { name: userId, entity: WS_ENTITY_MEMBER };

      const handler = (data: ServerMessage) => {
        if (
          data.type === WS_SERVER_TYPE_UPDATE &&
          data.body.kind === WS_UPDATE_KIND_SHARED_WITH &&
          data.body.entity === WS_ENTITY_MEMBER
        ) {
          const current: List<Item> | undefined = queryClient.getQueryData(
            SHARED_ITEMS_KEY,
          );
          const value = data.body.value;
          if (!isItem(value)) {
            return;
          }
          let mutation;
          switch (data.body.op) {
            case WS_UPDATE_OP_CREATE: {
              if (current && !current.find((i) => i.id === value.id)) {
                mutation = current.push(value);
                queryClient.setQueryData(SHARED_ITEMS_KEY, mutation);
                queryClient.setQueryData(buildItemKey(value.id), value);
              }
              break;
            }
            case WS_UPDATE_OP_DELETE: {
              if (current) {
                mutation = current.filter((i) => i.id !== value.id);
                queryClient.setQueryData(SHARED_ITEMS_KEY, mutation);
              }
              break;
            }
          }
        }
      };

      websocketClient.subscribe(channel, handler);

      return function cleanup() {
        websocketClient.unsubscribe(channel, handler);
      };
    }, [userId]);
  },

  useItemChatUpdates: (chatId: UUID) => {
    useEffect(() => {
      if (!chatId) {
        return;
      }

      const channel: Channel = { name: chatId, entity: WS_ENTITY_CHAT };

      const handler = (data: ServerMessage) => {
        if (
          data.type === WS_SERVER_TYPE_UPDATE &&
          data.body.kind === WS_UPDATE_KIND_CHAT_ITEM &&
          data.body.entity === WS_ENTITY_CHAT
        ) {
          const key = buildItemChatKey(chatId);
          const current: Chat | undefined = queryClient.getQueryData(key);
          const value = data.body.value;
          if (!isChatMessage(value)) {
            return;
          }
          if (data.body.op === WS_UPDATE_OP_PUBLISH) {
            if (current) {
              const newChat = Object.assign({}, current);
              newChat.messages = [...current.messages];
              newChat.messages.push(value);
              queryClient.setQueryData(key, newChat);
            }
          }
        }
      };

      websocketClient.subscribe(channel, handler);

      return function cleanup() {
        websocketClient.unsubscribe(channel, handler);
      };
    }, [chatId]);
  },
});

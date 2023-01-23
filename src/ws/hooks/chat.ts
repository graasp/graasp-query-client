import { useEffect } from 'react';
import { QueryClient } from 'react-query';

import { ChatMessage, UUID, convertJs } from '@graasp/sdk';
import { ChatMessageRecord, ItemChatRecord } from '@graasp/sdk/frontend';

import { buildItemChatKey } from '../../config/keys';
import { KINDS, OPS, TOPICS } from '../constants';
import { Channel, WebsocketClient } from '../ws-client';

// todo: use graasp-types?
interface ChatEvent {
  kind: string;
  op: string;
  message: ChatMessage;
}

// eslint-disable-next-line import/prefer-default-export
export const configureWsChatHooks = (
  queryClient: QueryClient,
  websocketClient: WebsocketClient,
) => ({
  /**
   * React hook to subscribe to the updates of the given chat ID
   * @param chatId The ID of the chat of which to observe updates
   */
  useItemChatUpdates: (chatId: UUID | null) => {
    useEffect(() => {
      if (!chatId) {
        return () => {
          // do nothing
        };
      }

      const channel: Channel = {
        name: chatId,
        topic: TOPICS.CHAT_ITEM,
      };

      const handler = (event: ChatEvent) => {
        if (event.kind === KINDS.ITEM) {
          const chatKey = buildItemChatKey(chatId);
          const current = queryClient.getQueryData<ItemChatRecord>(chatKey);
          console.error(current);

          const message: ChatMessageRecord = convertJs(event.message);

          if (current) {
            switch (event.op) {
              case OPS.PUBLISH: {
                const mutation = current.push(message);
                queryClient.setQueryData(chatKey, mutation);
                break;
              }
              case OPS.UPDATE: {
                const mutation = current.update(
                  current.findIndex((m) => m.id === event.message.id),
                  () => message,
                );
                queryClient.setQueryData(chatKey, mutation);
                break;
              }
              case OPS.DELETE: {
                const mutation = current.delete(
                  current.findIndex((m) => m.id !== message.id),
                );
                queryClient.setQueryData(chatKey, mutation);
                break;
              }
              case OPS.CLEAR: {
                const mutation = current.clear();
                queryClient.setQueryData(chatKey, mutation);
                break;
              }
              default:
                break;
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

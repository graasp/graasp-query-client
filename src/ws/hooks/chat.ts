import { Channel, ChatMessage, UUID, WebsocketClient } from '@graasp/sdk';

import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { buildItemChatKey } from '../../keys.js';
import { KINDS, OPS, TOPICS } from '../constants.js';

// todo: use graasp-types?
interface ChatEvent {
  kind: string;
  op: string;
  message: ChatMessage;
}

export const configureWsChatHooks = (websocketClient: WebsocketClient) => ({
  /**
   * React hook to subscribe to the updates of the given chat ID
   * @param chatId The ID of the chat of which to observe updates
   */
  useItemChatUpdates: (chatId: UUID | null) => {
    const queryClient = useQueryClient();
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
          const current = queryClient.getQueryData<ChatMessage[]>(chatKey);

          const { message } = event;

          if (current) {
            switch (event.op) {
              case OPS.PUBLISH: {
                queryClient.setQueryData(chatKey, [...current, message]);
                break;
              }
              case OPS.UPDATE: {
                const index = current.findIndex(
                  (m) => m.id === event.message.id,
                );
                if (index >= 0) {
                  const messages = [
                    ...current.slice(0, index),
                    message,
                    ...current.slice(index + 1),
                  ];
                  queryClient.setQueryData(chatKey, messages);
                }
                break;
              }
              case OPS.DELETE: {
                const index = current.findIndex((m) => m.id === message.id);
                if (index >= 0) {
                  const mutation = [
                    ...current.slice(0, index),
                    ...current.slice(index + 1),
                  ];
                  queryClient.setQueryData(chatKey, mutation);
                }
                break;
              }
              case OPS.CLEAR: {
                queryClient.setQueryData(chatKey, []);
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

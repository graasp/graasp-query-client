import { Record } from 'immutable';
import { useEffect } from 'react';
import { QueryClient } from 'react-query';
import { buildItemChatKey } from '../../config/keys';
import { Chat, ChatMessage, UUID } from '../../types';
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

      const channel: Channel = { name: chatId, topic: TOPICS.CHAT_ITEM };

      const handler = (event: ChatEvent) => {
        if (event.kind === KINDS.ITEM) {
          const chatKey = buildItemChatKey(chatId);
          const current: Record<Chat> | undefined =
            queryClient.getQueryData(chatKey);

          if (current) {
            switch (event.op) {
              case OPS.PUBLISH: {
                const mutation = current.update('messages', (messages) => [
                  ...messages,
                  event.message,
                ]);
                queryClient.setQueryData(chatKey, mutation);
                break;
              }
              case OPS.UPDATE: {
                const mutation = current.update('messages', (messages) => {
                  const index = messages.findIndex(
                    (m) => m.id === event.message.id,
                  );
                  // eslint-disable-next-line no-param-reassign
                  messages[index] = event.message;
                  return messages;
                });
                queryClient.setQueryData(chatKey, mutation);
                break;
              }
              case OPS.DELETE: {
                const mutation = current.update('messages', (messages) =>
                  messages.filter((m) => m.id !== event.message.id),
                );
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

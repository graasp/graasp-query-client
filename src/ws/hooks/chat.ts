import { ChatMessage, ItemChat, UUID } from '@graasp/sdk';
import { Channel, WebsocketClient } from '@graasp/sdk/frontend';

import { useEffect } from 'react';
import { useQueryClient } from 'react-query';

import { buildItemChatKey } from '../../config/keys';
import { KINDS, OPS, TOPICS } from '../constants';

// todo: use graasp-types?
interface ChatEvent {
  kind: string;
  op: string;
  message: ChatMessage;
}

// eslint-disable-next-line import/prefer-default-export
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
          const current = queryClient.getQueryData<ItemChat>(chatKey);

          const { message } = event;

          if (current) {
            switch (event.op) {
              case OPS.PUBLISH: {
                const mutation = { ...current, message };
                queryClient.setQueryData(chatKey, mutation);
                break;
              }
              case OPS.UPDATE: {
                const index = current.messages.findIndex(
                  (m) => m.id === event.message.id,
                );
                // TODO CHECK !!!!!!!!!
                current.messages
                  .slice(0, index)
                  .concat([message])
                  .concat(current.messages.slice(index + 1));

                queryClient.setQueryData(chatKey, current);
                break;
              }
              case OPS.DELETE: {
                // TODO CHECK !!!!!!!!!
                const index = current.messages.findIndex(
                  (m) => m.id === message.id,
                );
                current.messages
                  .slice(0, index)
                  .concat(current.messages.slice(index + 1));
                queryClient.setQueryData(chatKey, current);
                break;
              }
              case OPS.CLEAR: {
                // TODO CHECK !!!!!!!!!
                current.messages = [];
                queryClient.setQueryData(chatKey, current);
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

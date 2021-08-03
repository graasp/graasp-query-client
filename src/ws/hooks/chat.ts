import { QueryClient } from 'react-query';
import { buildItemChatKey } from '../../config/keys';
import { Chat, ChatMessage, UUID } from '../../types';
import { Channel, GraaspWebsocketClient } from '../ws-client';

// todo: use graasp-types?
interface ChatEvent {
  kind: string;
  op: string;
  message: ChatMessage;
}

export default (
  websocketClient: GraaspWebsocketClient,
  queryClient: QueryClient,
) => ({
  /**
   * React hook to subscribe to the updates of the given chat ID
   * @param chatId The ID of the chat of which to observves updates
   */
  useItemChatUpdates: (chatId: UUID) => {
    if (!chatId) {
      return;
    }

    const channel: Channel = { name: chatId, topic: 'chat/item' };

    const handler = (event: ChatEvent) => {
      if (event.kind === 'item') {
        const chatKey = buildItemChatKey(chatId);
        const current: Chat | undefined = queryClient.getQueryData(chatKey);

        if (current) {
          switch (event.op) {
            case 'publish': {
              const msg = event.message;
              const newChat = Object.assign({}, current);
              newChat.messages = [...current.messages];
              newChat.messages.push(msg);
              queryClient.setQueryData(chatKey, newChat);
              break;
            }
          }
        }
      }
    };

    websocketClient.subscribe(channel, handler);

    return function cleanup() {
      websocketClient.unsubscribe(channel, handler);
    };
  },
});

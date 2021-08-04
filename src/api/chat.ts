import { PartialChatMessage, QueryClientConfig, UUID } from '../types';
import { buildGetItemChatRoute, buildPostItemChatMessageRoute } from './routes';
import { DEFAULT_GET, DEFAULT_POST, failOnError } from './utils';

export const getItemChat = async (
  id: UUID,
  { API_HOST }: QueryClientConfig,
) => {
  const res = await fetch(
    `${API_HOST}/${buildGetItemChatRoute(id)}`,
    DEFAULT_GET,
  ).then(failOnError);
  const itemChat = await res.json();
  return itemChat;
};

export const postItemChatMessage = async (
  { chatId, body }: PartialChatMessage,
  { API_HOST }: QueryClientConfig,
) => {
  const res = await fetch(
    `${API_HOST}/${buildPostItemChatMessageRoute(chatId)}`,
    {
      ...DEFAULT_POST,
      body: JSON.stringify({ body }),
    },
  ).then(failOnError);
  const publishedMessage = await res.json();
  return publishedMessage;
};

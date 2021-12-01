import axios from 'axios';
import { PartialChatMessage, QueryClientConfig, UUID } from '../types';
import { buildGetItemChatRoute, buildPostItemChatMessageRoute } from './routes';

export const getItemChat = async (id: UUID, { API_HOST }: QueryClientConfig) =>
  axios
    .get(`${API_HOST}/${buildGetItemChatRoute(id)}`, {
      withCredentials: true,
    })
    .then(({ data }) => data);

export const postItemChatMessage = async (
  { chatId, body }: PartialChatMessage,
  { API_HOST }: QueryClientConfig,
) =>
  axios
    .post(`${API_HOST}/${buildPostItemChatMessageRoute(chatId)}`, {
      withCredentials: true,
      body,
    })
    .then(({ data }) => data);

import { PartialChatMessage, QueryClientConfig, UUID } from '../types';
import configureAxios, { verifyAuthentication } from './axios';
import { buildGetItemChatRoute, buildPostItemChatMessageRoute } from './routes';

const axios = configureAxios();

export const getItemChat = async (id: UUID, { API_HOST }: QueryClientConfig) =>
  verifyAuthentication(() =>
    axios
      .get(`${API_HOST}/${buildGetItemChatRoute(id)}`)
      .then(({ data }) => data),
  );

export const postItemChatMessage = async (
  { chatId, body }: PartialChatMessage,
  { API_HOST }: QueryClientConfig,
) =>
  verifyAuthentication(() =>
    axios
      .post(`${API_HOST}/${buildPostItemChatMessageRoute(chatId)}`, {
        body,
      })
      .then(({ data }) => data),
  );

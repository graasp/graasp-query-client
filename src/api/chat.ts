import {
  PartialChatMessage,
  PartialNewChatMessage,
  QueryClientConfig,
  UUID,
} from '../types';
import configureAxios, {
  fallbackToPublic,
  verifyAuthentication,
} from './axios';
import {
  buildDeleteItemChatMessageRoute,
  buildGetItemChatRoute,
  buildGetPublicItemChatRoute,
  buildPostItemChatMessageRoute,
} from './routes';

const axios = configureAxios();

export const getItemChat = async (id: UUID, { API_HOST }: QueryClientConfig) =>
  fallbackToPublic(
    () => axios.get(`${API_HOST}/${buildGetItemChatRoute(id)}`),
    () => axios.get(`${API_HOST}/${buildGetPublicItemChatRoute(id)}`),
  );

export const postItemChatMessage = async (
  { chatId, body }: PartialNewChatMessage,
  { API_HOST }: QueryClientConfig,
) =>
  verifyAuthentication(() =>
    axios
      .post(`${API_HOST}/${buildPostItemChatMessageRoute(chatId)}`, {
        body,
      })
      .then(({ data }) => data),
  );

export const deleteItemChatMessage = async (
  { chatId, messageId }: PartialChatMessage,
  { API_HOST }: QueryClientConfig,
) =>
  verifyAuthentication(() =>
    axios
      .delete(
        `${API_HOST}/${buildDeleteItemChatMessageRoute(chatId, messageId)}`,
      )
      .then(({ data }) => data),
  );

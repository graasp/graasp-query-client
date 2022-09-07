import {
  ChatMessage,
  ExportedChatMessage,
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
  buildClearItemChatRoute,
  buildDeleteItemChatMessageRoute,
  buildExportItemChatRoute,
  buildGetItemChatRoute,
  buildGetPublicItemChatRoute,
  buildPatchItemChatMessageRoute,
  buildPostItemChatMessageRoute,
} from './routes';

const axios = configureAxios();

export const getItemChat = async (id: UUID, { API_HOST }: QueryClientConfig) =>
  fallbackToPublic(
    () => axios.get(`${API_HOST}/${buildGetItemChatRoute(id)}`),
    () => axios.get(`${API_HOST}/${buildGetPublicItemChatRoute(id)}`),
  );

export const exportItemChat = async (
  id: UUID,
  { API_HOST }: QueryClientConfig,
) =>
  verifyAuthentication(
    (): Promise<ExportedChatMessage> =>
      axios
        .get(`${API_HOST}/${buildExportItemChatRoute(id)}`)
        .then(({ data }) => data),
  );

export const postItemChatMessage = async (
  { chatId, body }: PartialNewChatMessage,
  { API_HOST }: QueryClientConfig,
) =>
  verifyAuthentication(
    (): Promise<ChatMessage> =>
      axios
        .post(`${API_HOST}/${buildPostItemChatMessageRoute(chatId)}`, {
          body,
        })
        .then(({ data }) => data),
  );

export const patchItemChatMessage = async (
  { chatId, messageId, body }: PartialChatMessage,
  { API_HOST }: QueryClientConfig,
) =>
  verifyAuthentication(
    (): Promise<ChatMessage> =>
      axios
        .patch(
          `${API_HOST}/${buildPatchItemChatMessageRoute(chatId, messageId)}`,
          {
            body,
          },
        )
        .then(({ data }) => data),
  );

export const deleteItemChatMessage = async (
  { chatId, messageId }: PartialChatMessage,
  { API_HOST }: QueryClientConfig,
) =>
  verifyAuthentication(
    (): Promise<ChatMessage> =>
      axios
        .delete(
          `${API_HOST}/${buildDeleteItemChatMessageRoute(chatId, messageId)}`,
        )
        .then(({ data }) => data),
  );

export const clearItemChat = async (
  id: UUID,
  { API_HOST }: QueryClientConfig,
) =>
  verifyAuthentication(() =>
    axios
      .delete(`${API_HOST}/${buildClearItemChatRoute(id)}`)
      .then(({ data }) => data),
  );

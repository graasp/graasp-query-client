import { ChatMessage, ItemChat } from '@graasp/sdk/frontend';

import { ExportedChatMessage, QueryClientConfig, UUID } from '../types';
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

export const getItemChat = async (
  id: UUID,
  { API_HOST }: QueryClientConfig,
): Promise<ItemChat> =>
  fallbackToPublic(
    () => axios.get(`${API_HOST}/${buildGetItemChatRoute(id)}`),
    () => axios.get(`${API_HOST}/${buildGetPublicItemChatRoute(id)}`),
  );

export const exportItemChat = async (
  id: UUID,
  { API_HOST }: QueryClientConfig,
): Promise<ExportedChatMessage> =>
  verifyAuthentication(
    (): Promise<ExportedChatMessage> =>
      axios
        .get(`${API_HOST}/${buildExportItemChatRoute(id)}`)
        .then(({ data }) => data),
  );

export const postItemChatMessage = async (
  { chatId, body }: Pick<ChatMessage, 'chatId' | 'body'>,
  { API_HOST }: QueryClientConfig,
): Promise<ChatMessage> =>
  verifyAuthentication(
    (): Promise<ChatMessage> =>
      axios
        .post(`${API_HOST}/${buildPostItemChatMessageRoute(chatId)}`, {
          body,
        })
        .then(({ data }) => data),
  );

export const patchItemChatMessage = async (
  { chatId, id, body }: Pick<ChatMessage, 'chatId' | 'id' | 'body'>,
  { API_HOST }: QueryClientConfig,
): Promise<ChatMessage> =>
  verifyAuthentication(
    (): Promise<ChatMessage> =>
      axios
        .patch(`${API_HOST}/${buildPatchItemChatMessageRoute(chatId, id)}`, {
          body,
        })
        .then(({ data }) => data),
  );

export const deleteItemChatMessage = async (
  { chatId, id }: Pick<ChatMessage, 'chatId' | 'id'>,
  { API_HOST }: QueryClientConfig,
): Promise<ChatMessage> =>
  verifyAuthentication(
    (): Promise<ChatMessage> =>
      axios
        .delete(`${API_HOST}/${buildDeleteItemChatMessageRoute(chatId, id)}`)
        .then(({ data }) => data),
  );

export const clearItemChat = async (
  id: UUID,
  { API_HOST }: QueryClientConfig,
): Promise<void> =>
  verifyAuthentication(() =>
    axios
      .delete(`${API_HOST}/${buildClearItemChatRoute(id)}`)
      .then(({ data }) => data),
  );

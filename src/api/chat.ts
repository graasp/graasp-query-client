import {
  ChatMessage,
  DeleteChatMessageParamType,
  ExportedChatMessage,
  PatchChatMessageParamType,
  PostChatMessageParamType,
  UUID,
} from '@graasp/sdk';

import { QueryClientConfig } from '../types';
import configureAxios, { verifyAuthentication } from './axios';
import {
  buildClearItemChatRoute,
  buildDeleteItemChatMessageRoute,
  buildExportItemChatRoute,
  buildGetItemChatRoute,
  buildPatchItemChatMessageRoute,
  buildPostItemChatMessageRoute,
} from './routes';

const axios = configureAxios();

export const getItemChat = async (
  id: UUID,
  { API_HOST }: QueryClientConfig,
): Promise<ChatMessage[]> =>
  axios.get(`${API_HOST}/${buildGetItemChatRoute(id)}`);

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
  { itemId, body, mentions }: PostChatMessageParamType,
  { API_HOST }: QueryClientConfig,
) =>
  verifyAuthentication(
    (): Promise<ChatMessage> =>
      axios
        .post(`${API_HOST}/${buildPostItemChatMessageRoute(itemId)}`, {
          body,
          mentions,
        })
        .then(({ data }) => data),
  );

export const patchItemChatMessage = async (
  { itemId, messageId, body, mentions }: PatchChatMessageParamType,
  { API_HOST }: QueryClientConfig,
) =>
  verifyAuthentication(
    (): Promise<ChatMessage> =>
      axios
        .patch(
          `${API_HOST}/${buildPatchItemChatMessageRoute(itemId, messageId)}`,
          {
            body,
            mentions,
          },
        )
        .then(({ data }) => data),
  );

export const deleteItemChatMessage = async (
  { itemId, messageId }: DeleteChatMessageParamType,
  { API_HOST }: QueryClientConfig,
) =>
  verifyAuthentication(
    (): Promise<ChatMessage> =>
      axios
        .delete(
          `${API_HOST}/${buildDeleteItemChatMessageRoute(itemId, messageId)}`,
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

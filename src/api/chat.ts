import {
  ChatMessage,
  DeleteChatMessageParamType,
  ExportedItemChat,
  ItemChat,
  PatchChatMessageParamType,
  PostChatMessageParamType,
  UUID,
} from '@graasp/sdk';

import { PartialQueryConfigForApi } from '../types';
import { verifyAuthentication } from './axios';
import {
  buildClearItemChatRoute,
  buildDeleteItemChatMessageRoute,
  buildExportItemChatRoute,
  buildGetItemChatRoute,
  buildPatchItemChatMessageRoute,
  buildPostItemChatMessageRoute,
} from './routes';

export const getItemChat = async (
  id: UUID,
  { API_HOST, axios }: PartialQueryConfigForApi,
): Promise<ItemChat> =>
  axios
    .get(`${API_HOST}/${buildGetItemChatRoute(id)}`)
    .then(({ data }) => data);

export const exportItemChat = async (
  id: UUID,
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  verifyAuthentication(
    (): Promise<ExportedItemChat> =>
      axios
        .get(`${API_HOST}/${buildExportItemChatRoute(id)}`)
        .then(({ data }) => data),
  );

export const postItemChatMessage = async (
  { itemId, body, mentions }: PostChatMessageParamType,
  { API_HOST, axios }: PartialQueryConfigForApi,
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
  { API_HOST, axios }: PartialQueryConfigForApi,
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
  { API_HOST, axios }: PartialQueryConfigForApi,
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
  { API_HOST, axios }: PartialQueryConfigForApi,
): Promise<void> =>
  verifyAuthentication(() =>
    axios
      .delete(`${API_HOST}/${buildClearItemChatRoute(id)}`)
      .then(({ data }) => data),
  );

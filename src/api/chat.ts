import {
  ChatMessage,
  DeleteChatMessageParamType,
  PatchChatMessageParamType,
  PostChatMessageParamType,
  UUID,
} from '@graasp/sdk';

import {
  buildClearItemChatRoute,
  buildDeleteItemChatMessageRoute,
  buildGetItemChatRoute,
  buildPatchItemChatMessageRoute,
  buildPostItemChatMessageRoute,
} from '../routes.js';
import { PartialQueryConfigForApi } from '../types.js';
import { verifyAuthentication } from './axios.js';

export const getItemChat = async (
  id: UUID,
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  axios
    .get<ChatMessage[]>(`${API_HOST}/${buildGetItemChatRoute(id)}`)
    .then(({ data }) => data);

export const postItemChatMessage = async (
  { itemId, body, mentions }: PostChatMessageParamType,
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  verifyAuthentication(() =>
    axios
      .post<ChatMessage>(
        `${API_HOST}/${buildPostItemChatMessageRoute(itemId)}`,
        {
          body,
          mentions,
        },
      )
      .then(({ data }) => data),
  );

export const patchItemChatMessage = async (
  { itemId, messageId, body, mentions }: PatchChatMessageParamType,
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  verifyAuthentication(() =>
    axios
      .patch<ChatMessage>(
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
  verifyAuthentication(() =>
    axios
      .delete<ChatMessage>(
        `${API_HOST}/${buildDeleteItemChatMessageRoute(itemId, messageId)}`,
      )
      .then(({ data }) => data),
  );

export const clearItemChat = async (
  id: UUID,
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  verifyAuthentication(() =>
    axios
      .delete<void>(`${API_HOST}/${buildClearItemChatRoute(id)}`)
      .then(({ data }) => data),
  );

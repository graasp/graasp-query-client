import { ChatMention, UUID } from '@graasp/sdk';

import {
  buildClearMentionsRoute,
  buildDeleteMentionRoute,
  buildGetMemberMentionsRoute,
  buildPatchMentionRoute,
} from '../routes.js';
import { PartialQueryConfigForApi, QueryClientConfig } from '../types.js';
import { verifyAuthentication } from './axios.js';

export const getMemberMentions = async ({
  API_HOST,
  axios,
}: QueryClientConfig) =>
  verifyAuthentication(() =>
    axios
      .get<ChatMention[]>(`${API_HOST}/${buildGetMemberMentionsRoute()}`)
      .then(({ data }) => data),
  );

export const patchMemberMentionsStatus = async (
  { id: mentionId, status }: { id: UUID; status: string },
  { API_HOST, axios }: QueryClientConfig,
) =>
  verifyAuthentication(() =>
    axios
      .patch<ChatMention>(`${API_HOST}/${buildPatchMentionRoute(mentionId)}`, {
        status,
      })
      .then(({ data }) => data),
  );

export const deleteMention = async (
  mentionId: UUID,
  { API_HOST, axios }: QueryClientConfig,
) =>
  verifyAuthentication(() =>
    axios
      .delete<ChatMention>(`${API_HOST}/${buildDeleteMentionRoute(mentionId)}`)
      .then(({ data }) => data),
  );

export const clearMentions = async ({
  API_HOST,
  axios,
}: PartialQueryConfigForApi) =>
  verifyAuthentication(() =>
    axios
      .delete<ChatMention[]>(`${API_HOST}/${buildClearMentionsRoute()}`)
      .then(({ data }) => data),
  );

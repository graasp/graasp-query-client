import { ChatMention, UUID } from '@graasp/sdk';

import { PartialQueryConfigForApi, QueryClientConfig } from '../types';
import { verifyAuthentication } from './axios';
import {
  buildClearMentionsRoute,
  buildDeleteMentionRoute,
  buildGetMemberMentionsRoute,
  buildPatchMentionRoute,
} from './routes';

export const getMemberMentions = async ({
  API_HOST,
  axios,
}: QueryClientConfig): Promise<ChatMention[]> =>
  verifyAuthentication(() =>
    axios
      .get(`${API_HOST}/${buildGetMemberMentionsRoute()}`)
      .then(({ data }) => data),
  );

export const patchMemberMentionsStatus = async (
  { id: mentionId, status }: { id: UUID; status: string },
  { API_HOST, axios }: QueryClientConfig,
): Promise<ChatMention> =>
  verifyAuthentication(
    (): Promise<ChatMention> =>
      axios
        .patch(`${API_HOST}/${buildPatchMentionRoute(mentionId)}`, {
          status,
        })
        .then(({ data }) => data),
  );

export const deleteMention = async (
  mentionId: UUID,
  { API_HOST, axios }: QueryClientConfig,
): Promise<ChatMention> =>
  verifyAuthentication(() =>
    axios
      .delete(`${API_HOST}/${buildDeleteMentionRoute(mentionId)}`)
      .then(({ data }) => data),
  );

export const clearMentions = async ({
  API_HOST,
  axios,
}: PartialQueryConfigForApi): Promise<ChatMention[]> =>
  verifyAuthentication(() =>
    axios
      .delete(`${API_HOST}/${buildClearMentionsRoute()}`)
      .then(({ data }) => data),
  );

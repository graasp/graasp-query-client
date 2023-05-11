import { ChatMention, UUID } from '@graasp/sdk';

import { QueryClientConfig } from '../types';
import configureAxios, { verifyAuthentication } from './axios';
import {
  buildClearMentionsRoute,
  buildDeleteMentionRoute,
  buildGetMemberMentionsRoute,
  buildPatchMentionRoute,
} from './routes';

const axios = configureAxios();

export const getMemberMentions = async ({
  API_HOST,
}: QueryClientConfig): Promise<ChatMention[]> =>
  verifyAuthentication(
    () =>
      axios
        .get(`${API_HOST}/${buildGetMemberMentionsRoute()}`)
        .then(({ data }) => data),
  );

export const patchMemberMentionsStatus = async (
  { id: mentionId, status }: { id: UUID; status: string },
  { API_HOST }: QueryClientConfig,
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
  { mentionId }: { mentionId: UUID },
  { API_HOST }: QueryClientConfig,
): Promise<ChatMention> =>
  verifyAuthentication(
    () =>
      axios
        .delete(`${API_HOST}/${buildDeleteMentionRoute(mentionId)}`)
        .then(({ data }) => data),
  );

export const clearMentions = async ({
  API_HOST,
}: QueryClientConfig): Promise<ChatMention[]> =>
  verifyAuthentication(
    () =>
      axios
        .delete(`${API_HOST}/${buildClearMentionsRoute()}`)
        .then(({ data }) => data),
  );

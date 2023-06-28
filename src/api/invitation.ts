import { Invitation, ResultOf, UUID } from '@graasp/sdk';
import { NewInvitation } from '@graasp/sdk/frontend';

import { QueryClientConfig } from '../types';
import configureAxios, { verifyAuthentication } from './axios';
import {
  buildDeleteInvitationRoute,
  buildGetInvitationRoute,
  buildGetItemInvitationsForItemRoute,
  buildPatchInvitationRoute,
  buildPostInvitationsRoute,
  buildResendInvitationRoute,
} from './routes';

const axios = configureAxios();

// eslint-disable-next-line import/prefer-default-export
export const getInvitation = async (
  { API_HOST }: QueryClientConfig,
  id: UUID,
) =>
  axios
    .get(`${API_HOST}/${buildGetInvitationRoute(id)}`)
    .then(({ data }) => data);

export const postInvitations = async (
  { itemId, invitations }: { itemId: UUID; invitations: NewInvitation[] },
  { API_HOST }: QueryClientConfig,
): Promise<ResultOf<Invitation>> =>
  verifyAuthentication(() =>
    axios
      .post(`${API_HOST}/${buildPostInvitationsRoute(itemId)}`, { invitations })
      .then(({ data }) => data),
  );

export const getInvitationsForItem = async (
  id: UUID,
  { API_HOST }: QueryClientConfig,
): Promise<Invitation[]> =>
  verifyAuthentication(() =>
    axios
      .get(`${API_HOST}/${buildGetItemInvitationsForItemRoute(id)}`)
      .then(({ data }) => data),
  );

export const patchInvitation = async (
  payload: { itemId: UUID; id: UUID },
  body: Partial<Invitation>,
  { API_HOST }: QueryClientConfig,
): Promise<Invitation> =>
  verifyAuthentication(() =>
    axios
      .patch(`${API_HOST}/${buildPatchInvitationRoute(payload)}`, body)
      .then(({ data }) => data),
  );

export const deleteInvitation = async (
  payload: { itemId: UUID; id: UUID },
  { API_HOST }: QueryClientConfig,
): Promise<Invitation> =>
  verifyAuthentication(() =>
    axios
      .delete(`${API_HOST}/${buildDeleteInvitationRoute(payload)}`)
      .then(({ data }) => data),
  );

export const resendInvitation = async (
  payload: { itemId: UUID; id: UUID },
  { API_HOST }: QueryClientConfig,
): Promise<void> =>
  verifyAuthentication(() =>
    axios.post(`${API_HOST}/${buildResendInvitationRoute(payload)}`),
  );

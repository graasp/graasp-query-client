import { Invitation, ItemMembership, UUID } from '@graasp/sdk';

import { PartialQueryConfigForApi } from '../types.js';
import { buildPostUserCSVUploadRoute } from './routes.js';

// eslint-disable-next-line import/prefer-default-export
export const uploadUserCsv = async (
  { API_HOST, axios }: PartialQueryConfigForApi,
  id: UUID,
) =>
  axios
    .post<{
      invitations: Invitation[];
      memberships: ItemMembership[];
    }>(`${API_HOST}/${buildPostUserCSVUploadRoute(id)}`)
    .then(({ data }) => data);

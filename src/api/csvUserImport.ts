import { Invitation, ItemMembership, UUID } from '@graasp/sdk';

import { PartialQueryConfigForApi } from '../types.js';
import { buildPostUserCSVUploadRoute } from './routes.js';

// eslint-disable-next-line import/prefer-default-export
export const uploadUserCsv = async (
  { API_HOST, axios }: PartialQueryConfigForApi,
  {
    file,
    itemId,
    templateItemId,
  }: { file: File; itemId: UUID; templateItemId?: UUID },
) => {
  const formData = new FormData();
  formData.append('file', file);

  const url = new URL(buildPostUserCSVUploadRoute(itemId), API_HOST);
  if (templateItemId) {
    url.searchParams.set('templateId', templateItemId);
  }
  return axios
    .post<{
      invitations: Invitation[];
      memberships: ItemMembership[];
    }>(url.toString(), formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then(({ data }) => data);
};

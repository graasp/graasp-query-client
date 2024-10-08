import { Invitation, ItemMembership, UUID } from '@graasp/sdk';

import { buildPostUserCSVUploadRoute } from '../routes.js';
import { PartialQueryConfigForApi } from '../types.js';

type CSVInvitePayload = { file: File; itemId: UUID; templateItemId: undefined };
type CSVStructurePayload = { file: File; itemId: UUID; templateItemId: UUID };
export type UploadCSVPayload = CSVInvitePayload | CSVStructurePayload;

type CSVInviteResponse = {
  invitations: Invitation[];
  memberships: ItemMembership[];
};
type CSVStructureResponse = {
  groupName: string;
  invitations: Invitation[];
  memberships: ItemMembership[];
}[];

export const uploadUserCsv = async <K extends UploadCSVPayload>(
  { API_HOST, axios }: PartialQueryConfigForApi,
  { file, itemId, templateItemId }: K,
) => {
  const formData = new FormData();
  formData.append('file', file);

  const url = new URL(buildPostUserCSVUploadRoute(itemId), API_HOST);
  if (templateItemId) {
    url.searchParams.set('templateId', templateItemId);
  }
  return axios
    .post<
      K['templateItemId'] extends string
        ? CSVStructureResponse
        : CSVInviteResponse
    >(url.toString(), formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then(({ data }) => data);
};

import {
  CompleteMember,
  CurrentAccount,
  Member,
  MemberStorage,
  MemberStorageItem,
  Paginated,
  Pagination,
  Password,
  ResultOf,
  UUID,
} from '@graasp/sdk';

import { StatusCodes } from 'http-status-codes';

import { verifyAuthentication } from '../api/axios.js';
import { DEFAULT_THUMBNAIL_SIZE } from '../config/constants.js';
import { PartialQueryConfigForApi } from '../types.js';
import {
  buildDeleteCurrentMemberRoute,
  buildDownloadAvatarRoute,
  buildExportMemberDataRoute,
  buildGetCurrentMemberRoute,
  buildGetMemberRoute,
  buildGetMemberStorageFilesRoute,
  buildGetMemberStorageRoute,
  buildGetMembersByEmailRoute,
  buildGetMembersByIdRoute,
  buildPatchMemberPasswordRoute,
  buildPatchMemberRoute,
  buildPostMemberEmailUpdateRoute,
  buildPostMemberPasswordRoute,
  buildUploadAvatarRoute,
} from './routes.js';

export const getMembersByEmail = async (
  { emails }: { emails: string[] },
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  axios
    .get<ResultOf<Member>>(`${API_HOST}/${buildGetMembersByEmailRoute(emails)}`)
    .then(({ data }) => data);

export const getMember = async (
  { id }: { id: UUID },
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  axios
    .get<Member>(`${API_HOST}/${buildGetMemberRoute(id)}`)
    .then(({ data }) => data);

export const getMembers = (
  { ids }: { ids: UUID[] },
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  axios
    .get<ResultOf<Member>>(`${API_HOST}/${buildGetMembersByIdRoute(ids)}`)
    .then(({ data }) => data);

export const getCurrentMember = async ({
  API_HOST,
  axios,
}: PartialQueryConfigForApi) =>
  verifyAuthentication(() =>
    axios
      .get<CurrentAccount>(`${API_HOST}/${buildGetCurrentMemberRoute()}`)
      .then(({ data }) => data)
      .catch((error) => {
        if (error.response) {
          // return valid response for unauthorized requests
          // avoid infinite loading induced by failure in react-query
          if (error.response.status === StatusCodes.UNAUTHORIZED) {
            return null;
          }
        }
        throw error;
      }),
  );

export const getMemberStorage = async ({
  API_HOST,
  axios,
}: PartialQueryConfigForApi) =>
  verifyAuthentication(() =>
    axios
      .get<MemberStorage>(`${API_HOST}/${buildGetMemberStorageRoute()}`)
      .then(({ data }) => data),
  );

export const getMemberStorageFiles = async (
  pagination: Partial<Pagination>,
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  axios
    .get<
      Paginated<MemberStorageItem>
    >(`${API_HOST}/${buildGetMemberStorageFilesRoute(pagination)}`)
    .then(({ data }) => data);

export const editMember = async (
  payload: {
    id: UUID;
    extra?: CompleteMember['extra'];
    name?: string;
    enableSaveActions?: boolean;
  },
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  verifyAuthentication(() =>
    axios
      .patch<CompleteMember>(
        `${API_HOST}/${buildPatchMemberRoute(payload.id)}`,
        {
          extra: payload.extra,
          name: payload.name?.trim(),
          enableSaveActions: payload.enableSaveActions,
        },
      )
      .then(({ data }) => data),
  );

export const deleteCurrentMember = async ({
  API_HOST,
  axios,
}: PartialQueryConfigForApi) =>
  verifyAuthentication(() =>
    axios
      .delete<void>(`${API_HOST}/${buildDeleteCurrentMemberRoute()}`)
      .then(({ data }) => data),
  );

export const createPassword = async (
  payload: { password: Password },
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  axios
    .post<void>(`${API_HOST}/${buildPostMemberPasswordRoute()}`, payload)
    .then((data) => data);

export const updatePassword = async (
  payload: { password: Password; currentPassword: Password },
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  axios
    .patch<void>(`${API_HOST}/${buildPatchMemberPasswordRoute()}`, payload)
    .then((data) => data);

export const uploadAvatar = async (
  {
    filename,
    contentType,
  }: { itemId: UUID; filename: string; contentType: string },
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  verifyAuthentication(() =>
    axios
      .post(`${API_HOST}/${buildUploadAvatarRoute()}`, {
        // Send and receive JSON.
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
        },
        filename,
        contentType,
      })
      .then(({ data }) => data),
  );

export const downloadAvatar = async (
  { id, size = DEFAULT_THUMBNAIL_SIZE }: { id: UUID; size?: string },
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  axios
    .get<Blob>(
      `${API_HOST}/${buildDownloadAvatarRoute({ id, size, replyUrl: false })}`,
      {
        responseType: 'blob',
      },
    )
    .then(({ data }) => data);

export const downloadAvatarUrl = async (
  { id, size = DEFAULT_THUMBNAIL_SIZE }: { id: UUID; size?: string },
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  axios
    .get<string>(
      `${API_HOST}/${buildDownloadAvatarRoute({ id, size, replyUrl: true })}`,
    )
    .then(({ data }) => data);

export const updateEmail = async (
  email: string,
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  axios.post<void>(`${API_HOST}/${buildPostMemberEmailUpdateRoute()}`, {
    email,
  });

export const validateEmailUpdate = async (
  token: string,
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  axios.patch<void>(
    `${API_HOST}/${buildPostMemberEmailUpdateRoute()}`,
    {},
    // send the JWT as a bearer auth
    { headers: { Authorization: `Bearer ${token}` } },
  );

// Define the function to export member data
export const exportMemberData = async ({
  API_HOST,
  axios,
}: PartialQueryConfigForApi) =>
  axios
    .post<void>(`${API_HOST}/${buildExportMemberDataRoute()}`)
    .then(({ data }) => data);

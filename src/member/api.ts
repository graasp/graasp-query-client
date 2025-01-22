import {
  CompleteMember,
  CurrentAccount,
  Member,
  MemberStorage,
  MemberStorageItem,
  Paginated,
  Pagination,
  Password,
  UUID,
} from '@graasp/sdk';

import { AxiosProgressEvent } from 'axios';
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
  buildPatchCurrentMemberRoute,
  buildPatchMemberPasswordRoute,
  buildPostMemberEmailUpdateRoute,
  buildPostMemberPasswordRoute,
  buildUploadAvatarRoute,
} from './routes.js';

export const getMember = async (
  { id }: { id: UUID },
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  axios
    .get<Member>(`${API_HOST}/${buildGetMemberRoute(id)}`)
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

export const editCurrentMember = async (
  {
    name,
    extra,
    enableSaveActions,
  }: {
    extra?: CompleteMember['extra'];
    name?: string;
    enableSaveActions?: boolean;
  },
  { API_HOST, axios }: PartialQueryConfigForApi,
) => {
  const url = new URL(buildPatchCurrentMemberRoute(), API_HOST);
  const body: Partial<
    Pick<CompleteMember, 'extra' | 'name' | 'enableSaveActions'>
  > = {};
  if (name && name.trim() !== '') {
    // trim name
    body.name = name.trim();
  }
  if (extra && Object.keys(extra).length) {
    body.extra = extra;
  }
  if (enableSaveActions !== undefined) {
    body.enableSaveActions = enableSaveActions;
  }
  if (Object.keys(body).length) {
    return axios
      .patch<CompleteMember>(url.toString(), body)
      .then(({ data }) => data);
  } else {
    return null;
  }
};

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
  args: {
    file: Blob;
    onUploadProgress?: (progressEvent: AxiosProgressEvent) => void;
  },
  { API_HOST, axios }: PartialQueryConfigForApi,
) => {
  const { file } = args;
  const itemPayload = new FormData();

  /* WARNING: this file field needs to be the last one,
   * otherwise the normal fields can not be read
   * https://github.com/fastify/fastify-multipart?tab=readme-ov-file#usage
   */
  itemPayload.append('file', file);
  return axios
    .post<void>(`${API_HOST}/${buildUploadAvatarRoute()}`, itemPayload, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        args.onUploadProgress?.(progressEvent);
      },
    })
    .then(({ data }) => data);
};

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

import {
  CompleteMember,
  Member,
  MemberStorage,
  Password,
  ResultOf,
  UUID,
} from '@graasp/sdk';

import { StatusCodes } from 'http-status-codes';

import { DEFAULT_THUMBNAIL_SIZE } from '../config/constants.js';
import { PartialQueryConfigForApi } from '../types.js';
import { verifyAuthentication } from './axios.js';
import {
  GET_CURRENT_MEMBER_ROUTE,
  buildDeleteMemberRoute,
  buildDownloadAvatarRoute,
  buildGetMember,
  buildGetMemberStorage,
  buildGetMembersBy,
  buildGetMembersRoute,
  buildPatchMember,
  buildUpdateMemberPasswordRoute,
  buildUploadAvatarRoute,
} from './routes.js';

export const getMembersBy = async (
  { emails }: { emails: string[] },
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  axios
    .get<ResultOf<Member>>(`${API_HOST}/${buildGetMembersBy(emails)}`)
    .then(({ data }) => data);

export const getMember = async (
  { id }: { id: UUID },
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  axios
    .get<Member>(`${API_HOST}/${buildGetMember(id)}`)
    .then(({ data }) => data);

export const getMembers = (
  { ids }: { ids: UUID[] },
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  axios
    .get<ResultOf<Member>>(`${API_HOST}/${buildGetMembersRoute(ids)}`)
    .then(({ data }) => data);

export const getCurrentMember = async ({
  API_HOST,
  axios,
}: PartialQueryConfigForApi) =>
  verifyAuthentication(() =>
    axios
      .get<CompleteMember>(`${API_HOST}/${GET_CURRENT_MEMBER_ROUTE}`)
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
      .get<MemberStorage>(`${API_HOST}/${buildGetMemberStorage()}`)
      .then(({ data }) => data),
  );

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
      .patch<CompleteMember>(`${API_HOST}/${buildPatchMember(payload.id)}`, {
        extra: payload.extra,
        name: payload.name?.trim(),
        enableSaveActions: payload.enableSaveActions,
      })
      .then(({ data }) => data),
  );

export const deleteMember = async (
  { id }: { id: UUID },
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  verifyAuthentication(() =>
    axios
      .delete<Member>(`${API_HOST}/${buildDeleteMemberRoute(id)}`)
      .then(({ data }) => data),
  );

export const updatePassword = async (
  payload: { password: Password; currentPassword: Password },
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  verifyAuthentication(() =>
    axios
      .patch<void>(`${API_HOST}/${buildUpdateMemberPasswordRoute()}`, {
        password: payload.password,
        currentPassword: payload.currentPassword,
      })
      .then(({ data }) => data),
  );

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

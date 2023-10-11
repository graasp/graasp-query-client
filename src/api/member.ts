import { Member, MemberExtra, ResultOf, UUID } from '@graasp/sdk';
import { Password } from '@graasp/sdk/frontend';

import { StatusCodes } from 'http-status-codes';

import { DEFAULT_THUMBNAIL_SIZE, SIGNED_OUT_USER } from '../config/constants';
import { QueryClientConfig } from '../types';
import configureAxios, { verifyAuthentication } from './axios';
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
} from './routes';

const axios = configureAxios();

export const getMembersBy = async (
  { emails }: { emails: string[] },
  { API_HOST }: QueryClientConfig,
): Promise<ResultOf<Member>> =>
  axios
    .get(`${API_HOST}/${buildGetMembersBy(emails)}`)
    .then(({ data }) => data);

export const getMember = async (
  { id }: { id: UUID },
  { API_HOST }: QueryClientConfig,
) => axios.get(`${API_HOST}/${buildGetMember(id)}`).then(({ data }) => data);

export const getMembers = (
  { ids }: { ids: UUID[] },
  { API_HOST }: QueryClientConfig,
) =>
  axios
    .get<ResultOf<Member[]>>(`${API_HOST}/${buildGetMembersRoute(ids)}`)
    .then(({ data }) => data);

export const getCurrentMember = async ({ API_HOST }: QueryClientConfig) =>
  verifyAuthentication(() =>
    axios
      .get(`${API_HOST}/${GET_CURRENT_MEMBER_ROUTE}`)
      .then(({ data }) => data)
      .catch((error) => {
        if (error.response) {
          // return valid response for unauthorized requests
          // avoid infinite loading induced by failure in react-query
          if (error.response.status === StatusCodes.UNAUTHORIZED) {
            return SIGNED_OUT_USER;
          }
        }
        throw error;
      }),
  );

export const getMemberStorage = async ({ API_HOST }: QueryClientConfig) =>
  verifyAuthentication(() =>
    axios
      .get(`${API_HOST}/${buildGetMemberStorage()}`)
      .then(({ data }) => data),
  );

export const editMember = async (
  payload: { id: UUID; extra?: MemberExtra; name?: string },
  { API_HOST }: QueryClientConfig,
): Promise<Member> =>
  verifyAuthentication(() =>
    axios
      .patch(`${API_HOST}/${buildPatchMember(payload.id)}`, {
        extra: payload.extra,
      })
      .then(({ data }) => data),
  );

export const deleteMember = async (
  { id }: { id: UUID },
  { API_HOST }: QueryClientConfig,
) =>
  verifyAuthentication(() =>
    axios
      .delete(`${API_HOST}/${buildDeleteMemberRoute(id)}`)
      .then(({ data }) => data),
  );

export const updatePassword = async (
  payload: { password: Password; currentPassword: Password },
  { API_HOST }: QueryClientConfig,
): Promise<void> =>
  verifyAuthentication(() =>
    axios
      .patch(`${API_HOST}/${buildUpdateMemberPasswordRoute()}`, {
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
  { API_HOST }: QueryClientConfig,
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
  { API_HOST }: QueryClientConfig,
): Promise<Blob> =>
  axios
    .get(
      `${API_HOST}/${buildDownloadAvatarRoute({ id, size, replyUrl: false })}`,
      {
        responseType: 'blob',
      },
    )
    .then(({ data }) => data);

export const downloadAvatarUrl = async (
  { id, size = DEFAULT_THUMBNAIL_SIZE }: { id: UUID; size?: string },
  { API_HOST }: QueryClientConfig,
): Promise<string> =>
  axios
    .get(
      `${API_HOST}/${buildDownloadAvatarRoute({ id, size, replyUrl: true })}`,
    )
    .then(({ data }) => data);

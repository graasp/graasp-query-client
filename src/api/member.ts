import { StatusCodes } from 'http-status-codes';
import {
  buildGetMemberBy,
  buildGetMember,
  GET_CURRENT_MEMBER_ROUTE,
  buildPatchMember,
  buildGetMembersRoute,
  buildGetPublicMembersRoute,
  buildGetPublicMember,
  buildUploadAvatarRoute,
  buildDownloadAvatarRoute,
  buildDownloadPublicAvatarRoute,
  buildDeleteMemberRoute,
  buildUpdateMemberPassword,
} from './routes';
import { MemberExtra, Password, QueryClientConfig, UUID } from '../types';
import { DEFAULT_THUMBNAIL_SIZES, SIGNED_OUT_USER } from '../config/constants';
import configureAxios, {
  fallbackToPublic,
  verifyAuthentication,
} from './axios';

const axios = configureAxios();

export const getMemberBy = async (
  { email }: { email: string },
  { API_HOST }: QueryClientConfig,
) =>
  verifyAuthentication(() =>
    axios
      .get(`${API_HOST}/${buildGetMemberBy(email)}`)
      .then(({ data }) => data),
  );

export const getMember = async (
  { id }: { id: UUID },
  { API_HOST }: QueryClientConfig,
) =>
  fallbackToPublic(
    () => axios.get(`${API_HOST}/${buildGetMember(id)}`),
    () => axios.get(`${API_HOST}/${buildGetPublicMember(id)}`),
  );

export const getMembers = (
  { ids }: { ids: UUID[] },
  { API_HOST }: QueryClientConfig,
) =>
  fallbackToPublic(
    () => axios.get(`${API_HOST}/${buildGetMembersRoute(ids)}`),
    () => axios.get(`${API_HOST}/${buildGetPublicMembersRoute(ids)}`),
  );

export const getCurrentMember = async ({ API_HOST }: QueryClientConfig) =>
  verifyAuthentication(
    () =>
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
    SIGNED_OUT_USER,
  );

export const editMember = async (
  payload: { id: UUID; extra: MemberExtra },
  { API_HOST }: QueryClientConfig,
) =>
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
  payload: { id: UUID; password: Password, currentPassword: Password },
  { API_HOST }: QueryClientConfig,
) =>
  verifyAuthentication(() =>
    axios
      .patch(`${API_HOST}/${buildUpdateMemberPassword(payload.id)}`, {
        password: payload.password,
        currentPassword: payload.currentPassword
      })
      .then(({ data }) => data),
  );

export const uploadAvatar = async (
  {
    itemId,
    filename,
    contentType,
  }: { itemId: UUID; filename: string; contentType: string },
  { API_HOST }: QueryClientConfig,
) =>
  verifyAuthentication(() =>
    axios
      .post(`${API_HOST}/${buildUploadAvatarRoute(itemId)}`, {
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
  { id, size = DEFAULT_THUMBNAIL_SIZES }: { id: UUID; size?: string },
  { API_HOST }: QueryClientConfig,
) =>
  fallbackToPublic(
    () =>
      axios.get(`${API_HOST}/${buildDownloadAvatarRoute({ id, size })}`, {
        responseType: 'blob',
      }),
    () =>
      axios.get(`${API_HOST}/${buildDownloadPublicAvatarRoute({ id, size })}`, {
        responseType: 'blob',
      }),
  );

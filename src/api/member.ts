import { StatusCodes } from 'http-status-codes';
import axios from 'axios';
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
} from './routes';
import { Member, QueryClientConfig, UUID } from '../types';
import {
  DEFAULT_THUMBNAIL_SIZES,
  FALLBACK_TO_PUBLIC_FOR_STATUS_CODES,
  SIGNED_OUT_USER,
} from '../config/constants';

export const getMemberBy = async (
  { email }: { email: string },
  { API_HOST }: QueryClientConfig,
) =>
  axios
    .get(`${API_HOST}/${buildGetMemberBy(email)}`, {
      withCredentials: true,
    })
    .then(({ data }) => data);

export const getMember = async (
  { id }: { id: UUID },
  { API_HOST }: QueryClientConfig,
) =>
  axios
    .get(`${API_HOST}/${buildGetMember(id)}`, {
      withCredentials: true,
    })
    .then(({ data }) => data)
    .catch((e) => {
      if (FALLBACK_TO_PUBLIC_FOR_STATUS_CODES.includes(e.response.status)) {
        // try to fetch public items if cannot access privately
        return axios
          .get(`${API_HOST}/${buildGetPublicMember(id)}`, {
            withCredentials: true,
          })
          .then(({ data: d }) => d);
      }

      throw e;
    });

export const getMembers = (
  { ids }: { ids: UUID[] },
  { API_HOST }: QueryClientConfig,
) =>
  axios
    .get(`${API_HOST}/${buildGetMembersRoute(ids)}`, {
      withCredentials: true,
    })
    .then(({ data }) => data)
    .catch((e) => {
      if (e.response.status === StatusCodes.UNAUTHORIZED) {
        // try to fetch public items if cannot access privately
        return axios
          .get(`${API_HOST}/${buildGetPublicMembersRoute(ids)}`, {
            withCredentials: true,
          })
          .then(({ data: d }) => d);
      }

      throw e;
    });

export const getCurrentMember = async ({ API_HOST }: QueryClientConfig) =>
  axios
    .get(`${API_HOST}/${GET_CURRENT_MEMBER_ROUTE}`, {
      withCredentials: true,
    })
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
    });

export const editMember = async (
  payload: { id: UUID; member: Partial<Member> },
  { API_HOST }: QueryClientConfig,
) =>
  axios
    .patch(`${API_HOST}/${buildPatchMember(payload.id)}`, {
      withCredentials: true,
      ...payload,
    })
    .then(({ data }) => data);

export const uploadAvatar = async (
  {
    itemId,
    filename,
    contentType,
  }: { itemId: UUID; filename: string; contentType: string },
  { API_HOST }: QueryClientConfig,
) =>
  axios.post(
    `${API_HOST}/${buildUploadAvatarRoute(itemId)}`,
    {
      withCredentials: true,
      // Send and receive JSON.
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
      },
      filename,
      contentType,
    },
  ).then(({ data }) => data);

export const downloadAvatar = async (
  { id, size = DEFAULT_THUMBNAIL_SIZES }: { id: UUID; size?: string },
  { API_HOST }: QueryClientConfig,
) => axios.get(
  `${API_HOST}/${buildDownloadAvatarRoute({ id, size })}`,
  {
    withCredentials: true
  },
).then(({ data }) => data).catch(error => {
  if (FALLBACK_TO_PUBLIC_FOR_STATUS_CODES.includes(error?.response?.status)) {
    return axios.get(
      `${API_HOST}/${buildDownloadPublicAvatarRoute({ id, size })}`,
      {
        withCredentials: true
      },
    ).then(({ data }) => data);
  }

  throw error
})


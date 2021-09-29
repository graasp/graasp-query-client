import { StatusCodes } from 'http-status-codes';
import axios from 'axios';
import { failOnError, DEFAULT_GET, DEFAULT_PATCH } from './utils';
import {
  buildGetMemberBy,
  buildGetMember,
  GET_CURRENT_MEMBER_ROUTE,
  buildPatchMember,
  buildGetMembersRoute,
  buildGetPublicMembersRoute,
  buildGetPublicMember,
} from './routes';
import { Member, QueryClientConfig, UUID } from '../types';
import {
  FALLBACK_TO_PUBLIC_FOR_STATUS_CODES,
  SIGNED_OUT_USER,
} from '../config/constants';

export const getMemberBy = async (
  { email }: { email: string },
  { API_HOST }: QueryClientConfig,
) => {
  const res = await fetch(`${API_HOST}/${buildGetMemberBy(email)}`, {
    ...DEFAULT_GET,
  }).then(failOnError);

  return res.json();
};

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
          .then(({ data: d }) => d)
          .catch(() => {
            throw new Error(e.response?.statusText);
          });
      }

      throw new Error(e.response?.statusText);
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
          .then(({ data: d }) => d)
          .catch(() => {
            throw new Error(e.response?.statusText);
          });
      }

      throw new Error(e.response?.statusText);
    });

export const getCurrentMember = async ({ API_HOST }: QueryClientConfig) => {
  const res = await fetch(`${API_HOST}/${GET_CURRENT_MEMBER_ROUTE}`, {
    ...DEFAULT_GET,
  });

  if (res.ok) {
    return res.json();
  }

  // return valid response for unauthorized requests
  // avoid infinite loading induced by failure in react-query
  if (res.status === StatusCodes.UNAUTHORIZED) {
    return SIGNED_OUT_USER;
  }

  throw new Error(res.statusText);
};

export const editMember = async (
  payload: { id: UUID; member: Partial<Member> },
  { API_HOST }: QueryClientConfig,
) => {
  const { id } = payload;
  const res = await fetch(`${API_HOST}/${buildPatchMember(id)}`, {
    ...DEFAULT_PATCH,
    body: JSON.stringify(payload),
  }).then(failOnError);

  return res.json();
};

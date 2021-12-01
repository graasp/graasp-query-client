import axios from 'axios';
import { getMemberBy } from './member';
import {
  buildShareItemWithRoute,
  buildEditItemMembershipRoute,
  buildDeleteItemMembershipRoute,
  buildGetItemMembershipsForItemsRoute,
} from './routes';
import { MEMBER_NOT_FOUND_ERROR } from '../config/errors';
import { Permission, QueryClientConfig, UUID } from '../types';

export const getMembershipsForItems = async (
  ids: UUID[],
  { API_HOST }: QueryClientConfig,
) =>
  axios
    .get(`${API_HOST}/${buildGetItemMembershipsForItemsRoute(ids)}`, {
      withCredentials: true,
    })
    .then(({ data }) => data);

export const shareItemWith = async (
  {
    id,
    email,
    permission,
  }: { id: UUID; email: string; permission: Permission },
  config: QueryClientConfig,
) => {
  const { API_HOST } = config;
  const member = await getMemberBy({ email }, config);
  if (!member) {
    throw new Error(MEMBER_NOT_FOUND_ERROR);
  }

  return axios
    .post(`${API_HOST}/${buildShareItemWithRoute(id)}`, {
      withCredentials: true,
      memberId: member[0].id,
      permission,
    })
    .then(({ data }) => data);
};

export const editItemMembership = async (
  { id, permission }: { id: UUID; permission: Permission },
  { API_HOST }: QueryClientConfig,
) =>
  axios
    .patch(`${API_HOST}/${buildEditItemMembershipRoute(id)}`, {
      withCredentials: true,
      permission,
    })
    .then(({ data }) => data);

export const deleteItemMembership = async (
  { id }: { id: UUID },
  { API_HOST }: QueryClientConfig,
) =>
  axios
    .delete(`${API_HOST}/${buildDeleteItemMembershipRoute(id)}`, {
      withCredentials: true,
    })
    .then(({ data }) => data);

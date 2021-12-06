import { getMemberBy } from './member';
import {
  buildShareItemWithRoute,
  buildEditItemMembershipRoute,
  buildDeleteItemMembershipRoute,
  buildGetItemMembershipsForItemsRoute,
} from './routes';
import { MEMBER_NOT_FOUND_ERROR } from '../config/errors';
import { Permission, QueryClientConfig, UUID } from '../types';
import configureAxios, { verifyAuthentication } from './axios';

const axios = configureAxios();

export const getMembershipsForItems = async (
  ids: UUID[],
  { API_HOST }: QueryClientConfig,
) =>
  verifyAuthentication(() =>
    axios
      .get(`${API_HOST}/${buildGetItemMembershipsForItemsRoute(ids)}`)
      .then(({ data }) => data),
  );

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

  return verifyAuthentication(() =>
    axios
      .post(`${API_HOST}/${buildShareItemWithRoute(id)}`, {
        memberId: member[0].id,
        permission,
      })
      .then(({ data }) => data),
  );
};

export const editItemMembership = async (
  { id, permission }: { id: UUID; permission: Permission },
  { API_HOST }: QueryClientConfig,
) =>
  verifyAuthentication(() =>
    axios
      .patch(`${API_HOST}/${buildEditItemMembershipRoute(id)}`, {
        permission,
      })
      .then(({ data }) => data),
  );

export const deleteItemMembership = async (
  { id }: { id: UUID },
  { API_HOST }: QueryClientConfig,
) =>
  verifyAuthentication(() =>
    axios
      .delete(`${API_HOST}/${buildDeleteItemMembershipRoute(id)}`)
      .then(({ data }) => data),
  );

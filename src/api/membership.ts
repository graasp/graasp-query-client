import { ItemMembership, PermissionLevel, ResultOf, UUID } from '@graasp/sdk';
import { FAILURE_MESSAGES } from '@graasp/translations';

import { PartialQueryConfigForApi } from '../types';
import { verifyAuthentication } from './axios';
import { getMembersBy } from './member';
import {
  buildDeleteItemMembershipRoute,
  buildEditItemMembershipRoute,
  buildGetItemMembershipsForItemsRoute,
  buildPostItemMembershipRoute,
  buildPostManyItemMembershipsRoute,
} from './routes';

export const getMembershipsForItems = async (
  ids: UUID[],
  { API_HOST, axios }: PartialQueryConfigForApi,
): Promise<ResultOf<ItemMembership[]>> =>
  axios
    .get(`${API_HOST}/${buildGetItemMembershipsForItemsRoute(ids)}`)
    .then(({ data }) => data);

export const postManyItemMemberships = async (
  {
    memberships,
    itemId,
  }: { itemId: UUID; memberships: Partial<ItemMembership>[] },
  { API_HOST, axios }: PartialQueryConfigForApi,
): Promise<ResultOf<ItemMembership>> =>
  verifyAuthentication(() =>
    axios
      .post(`${API_HOST}/${buildPostManyItemMembershipsRoute(itemId)}`, {
        memberships,
      })
      .then(({ data }) => data),
  );

export const postItemMembership = async (
  {
    id,
    email,
    permission,
  }: { id: UUID; email: string; permission: PermissionLevel },
  config: PartialQueryConfigForApi,
): Promise<ItemMembership> => {
  const { API_HOST, axios } = config;
  const member = await getMembersBy({ emails: [email] }, config);

  if (!member || !Object.values(member.data).length) {
    throw new Error(FAILURE_MESSAGES.MEMBER_NOT_FOUND);
  }

  return verifyAuthentication(() =>
    axios
      .post(`${API_HOST}/${buildPostItemMembershipRoute(id)}`, {
        // assume will receive only one member
        memberId: Object.values(member.data)[0].id,
        permission,
      })
      .then(({ data }) => data),
  );
};

export const editItemMembership = async (
  { id, permission }: { id: UUID; permission: PermissionLevel },
  { API_HOST, axios }: PartialQueryConfigForApi,
): Promise<ItemMembership> =>
  verifyAuthentication(() =>
    axios
      .patch(`${API_HOST}/${buildEditItemMembershipRoute(id)}`, {
        permission,
      })
      .then(({ data }) => data),
  );

export const deleteItemMembership = async (
  { id }: { id: UUID },
  { API_HOST, axios }: PartialQueryConfigForApi,
): Promise<ItemMembership> =>
  verifyAuthentication(() =>
    axios
      .delete(`${API_HOST}/${buildDeleteItemMembershipRoute(id)}`)
      .then(({ data }) => data),
  );

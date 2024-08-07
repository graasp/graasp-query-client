import { ItemMembership, PermissionLevel, ResultOf, UUID } from '@graasp/sdk';
import { FAILURE_MESSAGES } from '@graasp/translations';

import { getMembersByEmail } from '../member/api.js';
import {
  buildDeleteItemMembershipRoute,
  buildEditItemMembershipRoute,
  buildGetItemMembershipsForItemsRoute,
  buildPostItemMembershipRoute,
  buildPostManyItemMembershipsRoute,
} from '../routes.js';
import { PartialQueryConfigForApi } from '../types.js';
import { verifyAuthentication } from './axios.js';

export const getMembershipsForItems = async (
  ids: UUID[],
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  axios
    .get<
      ResultOf<ItemMembership[]>
    >(`${API_HOST}/${buildGetItemMembershipsForItemsRoute(ids)}`)
    .then(({ data }) => data);

export const postManyItemMemberships = async (
  {
    memberships,
    itemId,
  }: { itemId: UUID; memberships: Partial<ItemMembership>[] },
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  verifyAuthentication(() =>
    axios
      .post<ResultOf<ItemMembership>>(
        `${API_HOST}/${buildPostManyItemMembershipsRoute(itemId)}`,
        {
          memberships,
        },
      )
      .then(({ data }) => data),
  );

export const postItemMembership = async (
  {
    id,
    email,
    permission,
  }: { id: UUID; email: string; permission: PermissionLevel },
  config: PartialQueryConfigForApi,
) => {
  const { API_HOST, axios } = config;
  const members = await getMembersByEmail({ emails: [email] }, config);

  if (!members || !Object.values(members.data).length) {
    throw new Error(FAILURE_MESSAGES.MEMBER_NOT_FOUND);
  }

  return verifyAuthentication(() =>
    axios
      .post<ItemMembership>(`${API_HOST}/${buildPostItemMembershipRoute(id)}`, {
        // assume will receive only one member
        memberId: Object.values(members.data)[0].id,
        permission,
      })
      .then(({ data }) => data),
  );
};

export const editItemMembership = async (
  { id, permission }: { id: UUID; permission: PermissionLevel },
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  verifyAuthentication(() =>
    axios
      .patch<ItemMembership>(
        `${API_HOST}/${buildEditItemMembershipRoute(id)}`,
        {
          permission,
        },
      )
      .then(({ data }) => data),
  );

export const deleteItemMembership = async (
  { id }: { id: UUID },
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  verifyAuthentication(() =>
    axios
      .delete<ItemMembership>(
        `${API_HOST}/${buildDeleteItemMembershipRoute(id)}`,
      )
      .then(({ data }) => data),
  );

import {
  Account,
  ItemMembership,
  PermissionLevel,
  ResultOf,
  UUID,
} from '@graasp/sdk';

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
    accountId,
    permission,
  }: { id: UUID; accountId: Account['id']; permission: PermissionLevel },
  config: PartialQueryConfigForApi,
) => {
  const { API_HOST, axios } = config;

  return verifyAuthentication(() =>
    axios
      .post<ItemMembership>(`${API_HOST}/${buildPostItemMembershipRoute(id)}`, {
        // assume will receive only one member
        accountId,
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

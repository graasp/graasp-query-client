import { FAILURE_MESSAGES } from '@graasp/translations';
import { getMembersBy } from './member';
import {
  buildPostItemMembershipRoute,
  buildEditItemMembershipRoute,
  buildDeleteItemMembershipRoute,
  buildGetItemMembershipsForItemsRoute,
  buildGetPublicItemMembershipsForItemsRoute,
  buildPostManyItemMembershipsRoute,
} from './routes';
import { Membership, Permission, QueryClientConfig, UUID } from '../types';
import configureAxios, {
  fallbackToPublic,
  verifyAuthentication,
} from './axios';

const axios = configureAxios();

export const getMembershipsForItems = async (
  ids: UUID[],
  { API_HOST }: QueryClientConfig,
) =>
  fallbackToPublic(
    () => axios.get(`${API_HOST}/${buildGetItemMembershipsForItemsRoute(ids)}`),
    () =>
      axios.get(
        `${API_HOST}/${buildGetPublicItemMembershipsForItemsRoute(ids)}`,
      ),
  );

export const postManyItemMemberships = async (
  { memberships, itemId }: { itemId: UUID; memberships: Partial<Membership>[] },
  config: QueryClientConfig,
): Promise<(Membership | Error)[]> => {
  const { API_HOST } = config;

  return verifyAuthentication(() =>
    axios
      .post(`${API_HOST}/${buildPostManyItemMembershipsRoute(itemId)}`, {
        memberships,
      })
      .then(({ data }) => data),
  );
};

export const postItemMembership = async (
  {
    id,
    email,
    permission,
  }: { id: UUID; email: string; permission: Permission },
  config: QueryClientConfig,
) => {
  const { API_HOST } = config;
  const member = await getMembersBy({ emails: [email] }, config);

  if (!member || member?.length < 1 || member[0].length < 1) {
    throw new Error(FAILURE_MESSAGES.MEMBER_NOT_FOUND);
  }

  return verifyAuthentication(() =>
    axios
      .post(`${API_HOST}/${buildPostItemMembershipRoute(id)}`, {
        // assume will receive only one member
        memberId: member[0][0].id,
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

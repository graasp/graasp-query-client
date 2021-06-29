import { getMemberBy } from './member';
import {
  failOnError,
  DEFAULT_GET,
  DEFAULT_POST,
  DEFAULT_PATCH,
  DEFAULT_DELETE,
} from './utils';
import {
  buildShareItemWithRoute,
  buildGetItemMembershipsForItemRoute,
  buildEditItemMembershipRoute,
  buildDeleteItemMembershipRoute,
} from './routes';
import { MEMBER_NOT_FOUND_ERROR } from '../config/errors';
import { Permission, QueryClientConfig, UUID } from '../types';

export const getMembershipsForItem = async (
  id: UUID,
  { API_HOST }: QueryClientConfig,
) => {
  const res = await fetch(
    `${API_HOST}/${buildGetItemMembershipsForItemRoute(id)}`,
    DEFAULT_GET,
  ).then(failOnError);

  return res.json();
};

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
  const res = await fetch(`${API_HOST}/${buildShareItemWithRoute(id)}`, {
    ...DEFAULT_POST,
    // supposed to have only one member for this mail
    body: JSON.stringify({ memberId: member[0].id, permission }),
  }).then(failOnError);

  return res.ok;
};

export const editItemMembership = async (
  { id, permission }: { id: UUID; permission: Permission },
  config: QueryClientConfig,
) => {
  const { API_HOST } = config;
  const res = await fetch(`${API_HOST}/${buildEditItemMembershipRoute(id)}`, {
    ...DEFAULT_PATCH,
    body: JSON.stringify({ permission }),
  }).then(failOnError);

  return res.ok;
};

export const deleteItemMembership = async (
  { id }: { id: UUID },
  config: QueryClientConfig,
) => {
  const { API_HOST } = config;
  const res = await fetch(`${API_HOST}/${buildDeleteItemMembershipRoute(id)}`, {
    ...DEFAULT_DELETE,
  }).then(failOnError);

  return res.ok;
};

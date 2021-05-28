import { getMemberBy } from './member';
import { failOnError, DEFAULT_GET, DEFAULT_POST } from './utils';
import {
  buildShareItemWithRoute,
  buildGetItemMembershipForItemRoute,
} from './routes';
import { MEMBER_NOT_FOUND_ERROR } from '../config/errors';
import { Permission, QueryClientConfig, UUID } from '../types';

export const getMembershipsForItem = async (
  id: UUID,
  { API_HOST }: QueryClientConfig,
) => {
  const res = await fetch(
    `${API_HOST}/${buildGetItemMembershipForItemRoute(id)}`,
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
    body: JSON.stringify({ memberId: member[0].id, permission }), // supposed to have only one member for this mail
  }).then(failOnError);

  return res.ok;
};

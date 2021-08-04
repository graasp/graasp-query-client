import { failOnError, DEFAULT_GET, DEFAULT_POST } from './utils';
import {
  buildPostGroupMembershipRoute,
  GET_OWN_GROUP_MEMBERSHIPS_ROUTES,
} from './routes';

import { QueryClientConfig, UUID } from '../types';
import { getMemberBy } from './member';
import { MEMBER_NOT_FOUND_ERROR } from '../config/errors';
export const getOwnGroupMemberships = async (
  { API_HOST }: QueryClientConfig,
) => {
  const res = await fetch(`${API_HOST}/${GET_OWN_GROUP_MEMBERSHIPS_ROUTES}`, {
    ...DEFAULT_GET,
  }).then(failOnError);
  return res.json();
};

export const postGroupMemberships = async (
  {
    id,
    email,
  }: { id: UUID; email: string;},
  config: QueryClientConfig,
) => {
  const { API_HOST } = config;

  const member = await getMemberBy({ email }, config);
  if (!member) {
    throw new Error(MEMBER_NOT_FOUND_ERROR);
  }
  const res = await fetch(`${API_HOST}/${buildPostGroupMembershipRoute(id)}`, {
    ...DEFAULT_POST,
    body: JSON.stringify({ member: member[0].id }),
  }).then(failOnError);

  return res.json();
};

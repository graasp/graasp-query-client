import { failOnError, DEFAULT_GET, DEFAULT_POST } from './utils';
import {
  buildGetGroupChildrenRoute,
  buildGetGroupRoute,
  buildGetGroupsRoute, buildPostGroupRoute, GET_ROOT_GROUPS_ROUTE,
} from './routes';

import { ExtendedGroup, QueryClientConfig, UUID } from '../types';
export const getGroup = async ( id: UUID,
  { API_HOST }: QueryClientConfig,
) => {
  const res = await fetch(`${API_HOST}/${buildGetGroupRoute(id)}`, {
    ...DEFAULT_GET,
  }).then(failOnError);

  return res.json();
};

export const getGroups = async (
  ids: UUID[],
  { API_HOST }: QueryClientConfig,
) => {
  const res = await fetch(
    `${API_HOST}/${buildGetGroupsRoute(ids)}`,
    DEFAULT_GET,
  ).then(failOnError);
  return await res.json();
};

export const postGroup = async (
  { name, parentId }: ExtendedGroup,
  { API_HOST }: QueryClientConfig,
) => {
  const res = await fetch(`${API_HOST}/${buildPostGroupRoute(parentId)}`, {
    ...DEFAULT_POST,
    body: JSON.stringify({ name, type: 'group' }),
  }).then(failOnError);
  return await res.json();
};

export const getRootGroups = async (
  { API_HOST }: QueryClientConfig,
) => {
  const res = await fetch(
    `${API_HOST}/${GET_ROOT_GROUPS_ROUTE}`,
    DEFAULT_GET,
  ).then(failOnError);
  return await res.json();
};

export const getGroupChildren = async (
  id: UUID,
  { API_HOST }: QueryClientConfig,
) => {
  const res = await fetch(
    `${API_HOST}/${buildGetGroupChildrenRoute(id)}`,
    DEFAULT_GET,
  ).then(failOnError);
  return await res.json();
};

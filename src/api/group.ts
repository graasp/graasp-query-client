import { failOnError, DEFAULT_GET, DEFAULT_POST } from './utils';
import {
  buildGetGroupChildrenRoute, buildGetGroupParentsRoute,
  buildGetGroupRoute,
  buildGetGroupsRoute, buildPostGroupRoute, GET_OWN_GROUPS_ROUTE, GET_ROOT_GROUPS_ROUTE,
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
  { name, email, parentId }: ExtendedGroup,
  { API_HOST }: QueryClientConfig,
) => {
  const res = await fetch(`${API_HOST}/${buildPostGroupRoute(parentId)}`, {
    ...DEFAULT_POST,
    body: email? JSON.stringify({ name, email, type: 'group' }) :JSON.stringify({ name, type: 'group' })  ,
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

export const getOwnGroups = async (
  { API_HOST }: QueryClientConfig,
) => {
  const res = await fetch(
    `${API_HOST}/${GET_OWN_GROUPS_ROUTE}`,
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

export const getGroupParents = async (
  id: UUID,
  { API_HOST }: QueryClientConfig,
) => {
  const res = await fetch(
    `${API_HOST}/${buildGetGroupParentsRoute(id)}`,
    DEFAULT_GET,
  ).then(failOnError);
  return await res.json();
};


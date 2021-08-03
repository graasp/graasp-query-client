import { failOnError, DEFAULT_GET, DEFAULT_POST } from './utils';
import {
  buildGetGroupRoute,
  buildGetGroupsRoute, buildPostGroupRoute,
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

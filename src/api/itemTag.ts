import {
  failOnError,
  DEFAULT_DELETE,
  DEFAULT_GET,
  DEFAULT_POST,
} from './utils';
import {
  buildDeleteItemTagRoute,
  buildGetItemTagsRoute,
  buildPostItemTagRoute,
  GET_TAGS_ROUTE,
} from './routes';
import { QueryClientConfig, UUID } from '../types';

export const getTags = async ({ API_HOST }: QueryClientConfig) => {
  const res = await fetch(`${API_HOST}/${GET_TAGS_ROUTE}`, DEFAULT_GET).then(
    failOnError,
  );

  return res.json();
};

export const getItemTags = async (
  id: UUID,
  { API_HOST }: QueryClientConfig,
) => {
  const res = await fetch(
    `${API_HOST}/${buildGetItemTagsRoute(id)}`,
    DEFAULT_GET,
  ).then(failOnError);

  return res.json();
};

// payload: tagId, itemPath, creator
export const postItemTag = async (
  {
    id,
    tagId,
    itemPath,
    creator,
  }: { id: UUID; tagId: UUID; itemPath: string; creator: UUID },
  { API_HOST }: QueryClientConfig,
) => {
  const res = await fetch(`${API_HOST}/${buildPostItemTagRoute(id)}`, {
    ...DEFAULT_POST,
    body: JSON.stringify({ tagId, itemPath, creator }),
  }).then(failOnError);

  return res.json();
};

export const deleteItemTag = async (
  { id, tagId }: { id: UUID; tagId: UUID },
  { API_HOST }: QueryClientConfig,
) => {
  const res = await fetch(
    `${API_HOST}/${buildDeleteItemTagRoute({ id, tagId })}`,
    DEFAULT_DELETE,
  ).then(failOnError);

  return res.ok;
};

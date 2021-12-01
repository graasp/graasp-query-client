import axios from 'axios';
import {
  buildDeleteItemTagRoute,
  buildGetItemTagsRoute,
  buildPostItemTagRoute,
  GET_TAGS_ROUTE,
} from './routes';
import { QueryClientConfig, UUID } from '../types';

export const getTags = async ({ API_HOST }: QueryClientConfig) =>
  axios
    .get(`${API_HOST}/${GET_TAGS_ROUTE}`, {
      withCredentials: true,
    })
    .then(({ data }) => data);

export const getItemTags = async (id: UUID, { API_HOST }: QueryClientConfig) =>
  axios
    .get(`${API_HOST}/${buildGetItemTagsRoute(id)}`, {
      withCredentials: true,
    })
    .then(({ data }) => data);

// payload: tagId, itemPath, creator
export const postItemTag = async (
  {
    id,
    tagId,
    itemPath,
    creator,
  }: { id: UUID; tagId: UUID; itemPath: string; creator: UUID },
  { API_HOST }: QueryClientConfig,
) =>
  axios
    .post(`${API_HOST}/${buildPostItemTagRoute(id)}`, {
      withCredentials: true,
      tagId,
      itemPath,
      creator,
    })
    .then(({ data }) => data);

export const deleteItemTag = async (
  { id, tagId }: { id: UUID; tagId: UUID },
  { API_HOST }: QueryClientConfig,
) =>
  axios
    .delete(`${API_HOST}/${buildDeleteItemTagRoute({ id, tagId })}`, {
      withCredentials: true,
    })
    .then(({ data }) => data);

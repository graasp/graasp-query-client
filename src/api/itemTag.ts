import { ItemTagType, UUID } from '@graasp/sdk';

import { PartialQueryConfigForApi } from '../types';
import { verifyAuthentication } from './axios';
import {
  GET_TAGS_ROUTE,
  buildDeleteItemTagRoute,
  buildGetItemTagsRoute,
  buildGetItemsTagsRoute,
  buildPostItemTagRoute,
} from './routes';

export const getTags = async ({ API_HOST, axios }: PartialQueryConfigForApi) =>
  axios.get(`${API_HOST}/${GET_TAGS_ROUTE}`).then(({ data }) => data);

export const getItemTags = async (
  id: UUID,
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  axios
    .get(`${API_HOST}/${buildGetItemTagsRoute(id)}`)
    .then(({ data }) => data);

export const getItemsTags = async (
  ids: UUID[],
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  axios
    .get(`${API_HOST}/${buildGetItemsTagsRoute(ids)}`)
    .then(({ data }) => data);

// payload: tagId, itemPath, creator
export const postItemTag = async (
  { itemId, type }: { itemId: UUID; type: ItemTagType },
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  verifyAuthentication(() =>
    axios
      .post(`${API_HOST}/${buildPostItemTagRoute({ itemId, type })}`)
      .then(({ data }) => data),
  );

export const deleteItemTag = async (
  { itemId, type }: { itemId: UUID; type: `${ItemTagType}` | ItemTagType },
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  verifyAuthentication(() =>
    axios
      .delete(`${API_HOST}/${buildDeleteItemTagRoute({ itemId, type })}`)
      .then(({ data }) => data),
  );

import { ItemTagType, UUID } from '@graasp/sdk';

import { QueryClientConfig } from '../types';
import configureAxios, { verifyAuthentication } from './axios';
import {
  GET_TAGS_ROUTE,
  buildDeleteItemTagRoute,
  buildGetItemTagsRoute,
  buildGetItemsTagsRoute,
  buildPostItemTagRoute,
} from './routes';

const axios = configureAxios();

export const getTags = async ({ API_HOST }: QueryClientConfig) =>
  axios.get(`${API_HOST}/${GET_TAGS_ROUTE}`).then(({ data }) => data);

export const getItemTags = async (id: UUID, { API_HOST }: QueryClientConfig) =>
  axios
    .get(`${API_HOST}/${buildGetItemTagsRoute(id)}`)
    .then(({ data }) => data);

export const getItemsTags = async (
  ids: UUID[],
  { API_HOST }: QueryClientConfig,
) =>
  axios
    .get(`${API_HOST}/${buildGetItemsTagsRoute(ids)}`)
    .then(({ data }) => data);

// payload: tagId, itemPath, creator
export const postItemTag = async (
  { itemId, type }: { itemId: UUID; type: ItemTagType },
  { API_HOST }: QueryClientConfig,
) =>
  verifyAuthentication(() =>
    axios
      .post(`${API_HOST}/${buildPostItemTagRoute({ itemId, type })}`)
      .then(({ data }) => data),
  );

export const deleteItemTag = async (
  { itemId, type }: { itemId: UUID; type: ItemTagType },
  { API_HOST }: QueryClientConfig,
) =>
  verifyAuthentication(() =>
    axios
      .delete(`${API_HOST}/${buildDeleteItemTagRoute({ itemId, type })}`)
      .then(({ data }) => data),
  );

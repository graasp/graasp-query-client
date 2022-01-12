import {
  buildDeleteItemTagRoute,
  buildGetItemsTagsRoute,
  buildGetItemTagsRoute,
  buildPostItemTagRoute,
  GET_TAGS_ROUTE,
} from './routes';
import { QueryClientConfig, UUID } from '../types';
import configureAxios, { verifyAuthentication } from './axios';

const axios = configureAxios();

export const getTags = async ({ API_HOST }: QueryClientConfig) =>
  verifyAuthentication(() =>
    axios.get(`${API_HOST}/${GET_TAGS_ROUTE}`).then(({ data }) => data),
  );

export const getItemTags = async (id: UUID, { API_HOST }: QueryClientConfig) =>
  verifyAuthentication(() =>
    axios
      .get(`${API_HOST}/${buildGetItemTagsRoute(id)}`)
      .then(({ data }) => data),
  );
export const getItemsTags = async (ids: UUID[], { API_HOST }: QueryClientConfig) =>
  verifyAuthentication(() =>
    axios
      .get(`${API_HOST}/${buildGetItemsTagsRoute(ids)}`)
      .then(({ data }) => data),
  );

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
  verifyAuthentication(() =>
    axios
      .post(`${API_HOST}/${buildPostItemTagRoute(id)}`, {
        tagId,
        itemPath,
        creator,
      })
      .then(({ data }) => data),
  );

export const deleteItemTag = async (
  { id, tagId }: { id: UUID; tagId: UUID },
  { API_HOST }: QueryClientConfig,
) =>
  verifyAuthentication(() =>
    axios
      .delete(`${API_HOST}/${buildDeleteItemTagRoute({ id, tagId })}`)
      .then(({ data }) => data),
  );

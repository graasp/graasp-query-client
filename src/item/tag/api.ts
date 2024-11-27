import { DiscriminatedItem, Tag } from '@graasp/sdk';

import { PartialQueryConfigForApi } from '../../types.js';
import {
  buildAddTagRoute,
  buildGetTagsByItemRoute,
  buildRemoveTagRoute,
} from './routes.js';

export const getTagsByItem = async (
  args: {
    itemId: DiscriminatedItem['id'];
  },
  { API_HOST, axios }: PartialQueryConfigForApi,
) => {
  return axios
    .get<Tag[]>(`${API_HOST}/${buildGetTagsByItemRoute(args)}`)
    .then(({ data }) => data);
};

export const addTag = async (
  args: {
    itemId: DiscriminatedItem['id'];
    tagName: string;
  },
  { API_HOST, axios }: PartialQueryConfigForApi,
) => {
  return axios
    .post<void>(`${API_HOST}/${buildAddTagRoute(args)}`)
    .then(({ data }) => data);
};

export const removeTag = async (
  args: {
    itemId: DiscriminatedItem['id'];
    tagName: string;
  },
  { API_HOST, axios }: PartialQueryConfigForApi,
) => {
  return axios
    .delete<void>(`${API_HOST}/${buildRemoveTagRoute(args)}`)
    .then(({ data }) => data);
};

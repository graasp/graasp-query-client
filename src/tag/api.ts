import { Tag, TagCategory } from '@graasp/sdk';

import { PartialQueryConfigForApi } from '../types.js';
import { buildGetTagsRoute } from './routes.js';

export const getTags = async (
  args: {
    search?: string;
    category?: TagCategory;
  },
  { API_HOST, axios }: PartialQueryConfigForApi,
) => {
  return axios
    .get<Tag[]>(`${API_HOST}/${buildGetTagsRoute(args)}`)
    .then(({ data }) => data);
};

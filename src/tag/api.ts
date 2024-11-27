import { Tag, TagCategory } from '@graasp/sdk';

import { PartialQueryConfigForApi } from '../types.js';
import { buildgetTagsRoute } from './routes.js';

export const getTags = async (
  args: {
    search?: string;
    category?: TagCategory;
  },
  { API_HOST, axios }: PartialQueryConfigForApi,
) => {
  return axios
    .post<Tag[]>(`${API_HOST}/${buildgetTagsRoute(args)}`)
    .then(({ data }) => data);
};

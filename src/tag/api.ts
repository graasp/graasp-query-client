import { Tag, TagCategory } from '@graasp/sdk';

import { PartialQueryConfigForApi } from '../types.js';
import { buildGetTagCountsRoute } from './routes.js';

export const getTagCounts = async (
  args: {
    search?: string;
    category?: TagCategory;
  },
  { API_HOST, axios }: PartialQueryConfigForApi,
) => {
  return axios
    .get<
      {
        id: Tag['id'];
        name: Tag['name'];
        category: Tag['category'];
        count: number;
      }[]
    >(`${API_HOST}/${buildGetTagCountsRoute(args)}`)
    .then(({ data }) => data);
};

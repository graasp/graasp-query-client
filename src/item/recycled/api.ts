import { DiscriminatedItem, Paginated, Pagination } from '@graasp/sdk';

import { verifyAuthentication } from '../../api/axios.js';
import { PartialQueryConfigForApi } from '../../types.js';
import { buildGetOwnRecycledItemRoute } from './routes.js';

export const getOwnRecycledItems = async (
  pagination: Partial<Pagination>,
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  verifyAuthentication(() =>
    axios
      .get<
        Paginated<DiscriminatedItem>
      >(`${API_HOST}/${buildGetOwnRecycledItemRoute(pagination)}`)
      .then(({ data }) => data),
  );

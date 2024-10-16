import { Paginated, Pagination, RecycledItemData } from '@graasp/sdk';

import { verifyAuthentication } from '../../api/axios.js';
import { PartialQueryConfigForApi } from '../../types.js';
import { buildGetOwnRecycledItemDataRoute } from './routes.js';

export const getOwnRecycledItemsData = async (
  pagination: Partial<Pagination>,
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  verifyAuthentication(() =>
    axios
      .get<
        Paginated<RecycledItemData>
      >(`${API_HOST}/${buildGetOwnRecycledItemDataRoute(pagination)}`)
      .then(({ data }) => data),
  );

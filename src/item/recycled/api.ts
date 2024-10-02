import { Paginated, Pagination, RecycledItemData } from '@graasp/sdk';

import { verifyAuthentication } from '../../api/axios.js';
import { PartialQueryConfigForApi } from '../../types.js';
import { ItemSearchParams } from '../types.js';
import { buildGetOwnRecycledItemDataRoute } from './routes.js';

export const getOwnRecycledItemsData = async (
  params: ItemSearchParams,
  pagination: Partial<Pagination>,
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  verifyAuthentication(() =>
    axios
      .get<
        Paginated<RecycledItemData>
      >(`${API_HOST}/${buildGetOwnRecycledItemDataRoute(params, pagination)}`)
      .then(({ data }) => data),
  );

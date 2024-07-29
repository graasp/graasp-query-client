import { PackedItem, Paginated, Pagination } from '@graasp/sdk';

import { verifyAuthentication } from '../../api/axios.js';
import { PartialQueryConfigForApi } from '../../types.js';
import { buildGetAccessibleItems } from '../routes.js';
import { ItemSearchParams } from '../types.js';

export const getAccessibleItems = async (
  params: ItemSearchParams,
  pagination: Partial<Pagination>,
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  verifyAuthentication(() =>
    axios
      .get<
        Paginated<PackedItem>
      >(`${API_HOST}/${buildGetAccessibleItems(params, pagination)}`)
      .then(({ data }) => data),
  );

import { Pagination } from '@graasp/sdk';

import { ITEMS_ROUTE, setSearchQueryParams } from '../routes.js';
import { ItemSearchParams } from '../types.js';

export const buildGetOwnRecycledItemDataRoute = (
  params: ItemSearchParams,
  pagination: Partial<Pagination>,
) => {
  const searchParams = setSearchQueryParams(params, pagination);
  return `${ITEMS_ROUTE}/recycled?${searchParams.toString()}`;
};

import { Pagination } from '@graasp/sdk';

import { ITEMS_ROUTE } from '../routes.js';

export const buildGetOwnRecycledItemRoute = ({
  pageSize,
  page,
}: Partial<Pagination>) => {
  const searchParams = new URLSearchParams();

  // pagination params
  searchParams.set('page', (page ?? 1).toString());
  if (pageSize) {
    searchParams.set('pageSize', pageSize.toString());
  }

  return `${ITEMS_ROUTE}/recycled?${searchParams.toString()}`;
};

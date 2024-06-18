import { PackedItem } from '@graasp/sdk';

import { verifyAuthentication } from '../../api/axios.js';
import {
  Paginated,
  PaginationParams,
  PartialQueryConfigForApi,
} from '../../types.js';
import { buildGetAccessibleItems } from '../routes.js';
import { ItemSearchParams } from '../types.js';

// eslint-disable-next-line import/prefer-default-export
export const getAccessibleItems = async (
  params: ItemSearchParams,
  pagination: PaginationParams,
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  verifyAuthentication(() =>
    axios
      .get<
        Paginated<PackedItem>
      >(`${API_HOST}/${buildGetAccessibleItems(params, pagination)}`)
      .then(({ data }) => data),
  );

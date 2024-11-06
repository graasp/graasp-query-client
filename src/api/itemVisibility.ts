import { ItemVisibility, UUID } from '@graasp/sdk';

import {
  buildDeleteItemVisibilityRoute,
  buildPostItemVisibilityRoute,
} from '../routes.js';
import { PartialQueryConfigForApi } from '../types.js';
import { verifyAuthentication } from './axios.js';

export const postItemVisibility = async (
  { itemId, type }: { itemId: UUID; type: ItemVisibility['type'] },
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  verifyAuthentication(() =>
    axios
      .post<ItemVisibility>(
        `${API_HOST}/${buildPostItemVisibilityRoute({ itemId, type })}`,
      )
      .then(({ data }) => data),
  );

export const deleteItemVisibility = async (
  { itemId, type }: { itemId: UUID; type: ItemVisibility['type'] },
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  verifyAuthentication(() =>
    axios
      .delete<ItemVisibility>(
        `${API_HOST}/${buildDeleteItemVisibilityRoute({ itemId, type })}`,
      )
      .then(({ data }) => data),
  );

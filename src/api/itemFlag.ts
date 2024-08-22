import { ItemFlag, UUID } from '@graasp/sdk';

import { buildPostItemFlagRoute } from '../routes.js';
import { PartialQueryConfigForApi } from '../types.js';

// payload: flagId, itemId
export const postItemFlag = async (
  { type, itemId }: { type: UUID; itemId: string },
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  axios
    .post<ItemFlag>(`${API_HOST}/${buildPostItemFlagRoute(itemId)}`, {
      type,
    })
    .then(({ data }) => data);

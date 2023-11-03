import { ItemFlag, UUID } from '@graasp/sdk';

import { PartialQueryConfigForApi } from '../types';
import { buildPostItemFlagRoute } from './routes';

// payload: flagId, itemId
// eslint-disable-next-line import/prefer-default-export
export const postItemFlag = async (
  { type, itemId }: { type: UUID; itemId: string },
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  axios
    .post<ItemFlag>(`${API_HOST}/${buildPostItemFlagRoute(itemId)}`, {
      type,
    })
    .then(({ data }) => data);

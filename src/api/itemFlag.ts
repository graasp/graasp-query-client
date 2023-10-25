import { ItemFlag, UUID } from '@graasp/sdk';

import { PartialQueryConfigForApi } from '../types';
import { verifyAuthentication } from './axios';
import { GET_FLAGS_ROUTE, buildPostItemFlagRoute } from './routes';

export const getFlags = async ({ API_HOST, axios }: PartialQueryConfigForApi) =>
  verifyAuthentication(() =>
    axios.get(`${API_HOST}/${GET_FLAGS_ROUTE}`).then(({ data }) => data),
  );

// payload: flagId, itemId
export const postItemFlag = async (
  { type, itemId }: { type: UUID; itemId: string },
  { API_HOST, axios }: PartialQueryConfigForApi,
): Promise<ItemFlag> =>
  axios
    .post(`${API_HOST}/${buildPostItemFlagRoute(itemId)}`, {
      type,
    })
    .then(({ data }) => data);

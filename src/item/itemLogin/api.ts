import { DiscriminatedItem } from '@graasp/sdk';

import { verifyAuthentication } from '../../api/axios.js';
import { PartialQueryConfigForApi } from '../../types.js';
import { buildEnroll } from './routes.js';

export const enroll = async (
  { itemId }: { itemId: DiscriminatedItem['id'] },
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  verifyAuthentication(() => {
    return axios.post<void>(`${API_HOST}/${buildEnroll(itemId)}`);
  });

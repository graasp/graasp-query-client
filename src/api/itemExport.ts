import { UUID } from '@graasp/sdk';

import { PartialQueryConfigForApi } from '../types';
import { buildExportItemRoute } from './routes';

/* eslint-disable import/prefer-default-export */
export const exportItem = async (
  id: UUID,
  { API_HOST, axios }: PartialQueryConfigForApi,
): Promise<Blob> =>
  // options?: { public: boolean },
  axios({
    url: `${API_HOST}/${buildExportItemRoute(id)}`,
    method: 'GET',
    responseType: 'blob',
  }).then(({ data }) => data);

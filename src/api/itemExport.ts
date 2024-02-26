import { UUID } from '@graasp/sdk';

import { PartialQueryConfigForApi } from '../types.js';
import { buildExportItemRoute } from './routes.js';

/* eslint-disable import/prefer-default-export */
export const exportItem = async (
  id: UUID,
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  // options?: { public: boolean },
  axios
    .get<Blob>(`${API_HOST}/${buildExportItemRoute(id)}`, {
      method: 'GET',
      responseType: 'blob',
    })
    .then(({ data }) => data);

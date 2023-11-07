import { UUID } from '@graasp/sdk';

import { PartialQueryConfigForApi } from '../types';
import { buildExportItemRoute } from './routes';

/* eslint-disable import/prefer-default-export */
export const exportItem = async (
  args: { itemId: UUID; type?: string },
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  axios
    .get<Blob>(`${API_HOST}/${buildExportItemRoute(args)}`, {
      method: 'GET',
      responseType: 'blob',
    })
    .then(({ data }) => data);

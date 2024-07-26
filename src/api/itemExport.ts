import { UUID } from '@graasp/sdk';

import { buildExportItemRoute } from '../routes.js';
import { PartialQueryConfigForApi } from '../types.js';

export const exportItem = async (
  id: UUID,
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  axios
    .get<Blob>(`${API_HOST}/${buildExportItemRoute(id)}`, {
      method: 'GET',
      responseType: 'blob',
    })
    .then(({ data, headers }) => {
      const name =
        headers['content-disposition']?.split('"')?.[1] ?? 'export-file';
      return { name, data };
    });

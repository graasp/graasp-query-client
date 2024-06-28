import { UUID } from '@graasp/sdk';

import { PartialQueryConfigForApi } from '../../types.js';
import { buildReorderItemRoute } from '../routes.js';

export const reorderItem = async (
  args: { id: UUID; previousItemId?: UUID },
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  axios
    .patch<string>(`${API_HOST}/${buildReorderItemRoute(args)}`, {
      previousItemId: args.previousItemId,
    })
    .then(({ data }) => data);

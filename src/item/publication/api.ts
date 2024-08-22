import { PublicationStatus, UUID } from '@graasp/sdk';

import { buildGetPublicationStatusRoute } from '../../routes.js';
import { PartialQueryConfigForApi } from '../../types.js';

export const getItemPublicationStatus = async (
  itemId: UUID,
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  axios
    .get<PublicationStatus>(
      `${API_HOST}/${buildGetPublicationStatusRoute(itemId)}`,
    )
    .then(({ data }) => data);

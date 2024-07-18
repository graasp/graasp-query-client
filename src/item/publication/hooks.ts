import { UUID } from '@graasp/sdk';

import { useQuery } from '@tanstack/react-query';

import { itemKeys } from '../../keys.js';
import { QueryClientConfig } from '../../types.js';
import { getItemPublicationStatus } from './api.js';

export default (queryConfig: QueryClientConfig) => {
  const { defaultQueryOptions } = queryConfig;

  return {
    usePublicationStatus: (itemId: UUID) =>
      useQuery({
        queryKey: itemKeys.single(itemId).publicationStatus,
        queryFn: () => getItemPublicationStatus(itemId, queryConfig),
        ...defaultQueryOptions,
        enabled: Boolean(itemId),
      }),
  };
};

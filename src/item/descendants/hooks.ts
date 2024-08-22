import { ItemTypeUnion, UUID } from '@graasp/sdk';

import { useQuery } from '@tanstack/react-query';

import { UndefinedArgument } from '../../config/errors.js';
import { itemKeys } from '../../keys.js';
import { QueryClientConfig } from '../../types.js';
import { getDescendants } from './api.js';

export const useDescendants =
  (queryConfig: QueryClientConfig) =>
  ({
    id,
    types,
    showHidden,
    enabled,
  }: {
    id?: UUID;
    types?: ItemTypeUnion[];
    showHidden?: boolean;
    enabled?: boolean;
  }) => {
    const { defaultQueryOptions } = queryConfig;

    return useQuery({
      queryKey: itemKeys.single(id).descendants({ types, showHidden }),
      queryFn: () => {
        if (!id) {
          throw new UndefinedArgument();
        }
        return getDescendants({ id, types, showHidden }, queryConfig);
      },
      ...defaultQueryOptions,
      enabled: enabled && Boolean(id),
    });
  };

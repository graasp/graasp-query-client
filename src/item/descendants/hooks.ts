import { ItemTypeUnion, UUID } from '@graasp/sdk';

import { useQuery, useQueryClient } from '@tanstack/react-query';

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

    const queryClient = useQueryClient();
    return useQuery({
      queryKey: itemKeys.single(id).descendants({ types, showHidden }),
      queryFn: () => {
        if (!id) {
          throw new UndefinedArgument();
        }
        return getDescendants({ id, types, showHidden }, queryConfig);
      },
      onSuccess: async (items) => {
        if (items?.length) {
          // save items in their own key
          items.forEach(async (item) => {
            const { id: itemId } = item;
            queryClient.setQueryData(itemKeys.single(itemId).content, item);
          });
        }
      },
      ...defaultQueryOptions,
      enabled: enabled && Boolean(id),
    });
  };

import { useQuery, useQueryClient } from '@tanstack/react-query';

import { itemKeys } from '../../config/keys.js';
import useDebounce from '../../hooks/useDebounce.js';
import { PaginationParams, QueryClientConfig } from '../../types.js';
import { ItemSearchParams } from '../routes.js';
import { getAccessibleItemsRoutine } from '../routines.js';
import { getAccessibleItems } from './accessible.api.js';

/**
 * Returns items the highest in the tree you have access to
 * Is paginated by default
 * @param params
 * @param pagination
 * @param _options
 * @returns
 */
// eslint-disable-next-line import/prefer-default-export
export const useAccessibleItems =
  (queryConfig: QueryClientConfig) =>
  (params?: ItemSearchParams, pagination?: PaginationParams) => {
    const { notifier, defaultQueryOptions } = queryConfig;

    const queryClient = useQueryClient();

    const debouncedName = useDebounce(params?.name, 500);
    const finalParams = { ...params, name: debouncedName };
    const paginationParams = { ...(pagination ?? {}) };
    return useQuery({
      queryKey: itemKeys.accessiblePage(finalParams, paginationParams),
      queryFn: () =>
        getAccessibleItems(finalParams, paginationParams, queryConfig),
      onSuccess: async ({ data: items }) => {
        // save items in their own key
        // eslint-disable-next-line no-unused-expressions
        items?.forEach(async (item) => {
          const { id } = item;
          queryClient.setQueryData(itemKeys.single(id).content, item);
        });
      },
      onError: (error) => {
        notifier?.({
          type: getAccessibleItemsRoutine.FAILURE,
          payload: { error },
        });
      },
      ...defaultQueryOptions,
    });
  };

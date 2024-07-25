import { Pagination } from '@graasp/sdk';

import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import useDebounce from '../../hooks/useDebounce.js';
import { itemKeys } from '../../keys.js';
import { QueryClientConfig } from '../../types.js';
import { getAccessibleItemsRoutine } from '../routines.js';
import { ItemSearchParams } from '../types.js';
import { getAccessibleItems } from './api.js';

/**
 * Returns items the highest in the tree you have access to
 * Is paginated by default
 * @param params
 * @param pagination  default and first page is 1
 * @param _options
 * @returns
 */
export const useAccessibleItems =
  (queryConfig: QueryClientConfig) =>
  (params?: ItemSearchParams, pagination?: Partial<Pagination>) => {
    const { notifier, defaultQueryOptions } = queryConfig;

    const queryClient = useQueryClient();

    const debouncedKeywords = useDebounce(params?.keywords, 500);
    const finalParams = { ...params, keywords: debouncedKeywords };
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

/**
 * Returns query and accummulated data through navigating the pages
 * Is paginated by default
 * @param params
 * @param pagination default and first page is 1
 * @returns
 */
export const useInfiniteAccessibleItems =
  (queryConfig: QueryClientConfig) =>
  (params?: ItemSearchParams, pagination?: Partial<Pagination>) => {
    const queryClient = useQueryClient();
    const debouncedKeywords = useDebounce(params?.keywords, 500);
    const finalParams = { ...params, keywords: debouncedKeywords };

    return useInfiniteQuery({
      queryKey: itemKeys.infiniteAccessible(finalParams),
      queryFn: ({ pageParam }) =>
        getAccessibleItems(
          finalParams,
          { page: pageParam ?? 1, ...pagination },
          queryConfig,
        ),
      onSuccess: async ({ pages }) => {
        // save items in their own key
        // eslint-disable-next-line no-unused-expressions
        for (const p of pages) {
          p?.data?.forEach(async (item) => {
            const { id } = item;
            queryClient.setQueryData(itemKeys.single(id).content, item);
          });
        }
      },
      getNextPageParam: (_lastPage, pages) => pages.length + 1,
      refetchOnWindowFocus: () => false,
    });
  };

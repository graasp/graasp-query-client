import { Pagination } from '@graasp/sdk';

import { useInfiniteQuery } from '@tanstack/react-query';

import useDebounce from '../../hooks/useDebounce.js';
import { memberKeys } from '../../keys.js';
import { QueryClientConfig } from '../../types.js';
import { ItemSearchParams } from '../types.js';
import { getOwnRecycledItemsData } from './api.js';

/**
 * Returns paginated own recycled item data
 * @param params
 * @param pagination  default and first page is 1
 * @param _options
 * @returns
 */
// export const useOwnRecycledItemData =
//   (queryConfig: QueryClientConfig) =>
//   (params?: ItemSearchParams, pagination?: Partial<Pagination>) => {
//     const { defaultQueryOptions } = queryConfig;
//     const debouncedKeywords = useDebounce(params?.keywords, 500);
//     const finalParams = { ...params, keywords: debouncedKeywords };
//     const paginationParams = { ...(pagination ?? {}) };

//     return useQuery({
//       queryKey: memberKeys
//         .current()
//         .recycledPage(finalParams, paginationParams),
//       queryFn: () =>
//         getOwnRecycledItemsData(finalParams, paginationParams, queryConfig),
//       meta: {
//         routine: getAccessibleItemsRoutine,
//       },
//       ...defaultQueryOptions,
//     });
//   };

/**
 * Returns paginated own recycled item data
 * @param params
 * @param pagination default and first page is 1
 * @returns
 */
export const useInfiniteOwnRecycledItemData =
  (queryConfig: QueryClientConfig) =>
  (
    params?: Omit<ItemSearchParams, 'creatorId'>,
    pagination?: Partial<Pagination>,
  ) => {
    const { defaultQueryOptions } = queryConfig;

    const debouncedKeywords = useDebounce(params?.keywords, 500);
    const finalParams = { ...params, keywords: debouncedKeywords };

    return useInfiniteQuery({
      queryKey: memberKeys.current().infiniteRecycledItemData(finalParams),
      queryFn: ({ pageParam }) =>
        getOwnRecycledItemsData(
          finalParams,
          { page: pageParam ?? 1, ...pagination },
          queryConfig,
        ),
      getNextPageParam: (_lastPage, pages) => pages.length + 1,
      refetchOnWindowFocus: () => false,
      initialPageParam: 1,
      ...defaultQueryOptions,
    });
  };

export const configureRecycledHooks = (queryConfig: QueryClientConfig) => {
  return {
    useInfiniteOwnRecycledItemData: useInfiniteOwnRecycledItemData(queryConfig),
  };
};

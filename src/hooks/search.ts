import { Category, convertJs } from '@graasp/sdk';

import { useQuery } from 'react-query';

import * as Api from '../api';
import { buildSearchPublishedItemsKey } from '../config/keys';
import { QueryClientConfig } from '../types';
import useDebounce from './useDebounce';

export default (queryConfig: QueryClientConfig) => {
  const { defaultQueryOptions } = queryConfig;

  // get search results
  return {
    useSearchPublishedItems: ({
      attributesToCrop,
      categories,
      cropLength,
      enabled = true,
      isPublishedRoot = true,
      limit,
      query,
      sort,
    }: {
      categories?: Category['id'][][];
      enabled?: boolean;
      isPublishedRoot?: boolean;
      query?: string;
    } & Api.MeiliSearchProps) => {
      const debouncedQuery = useDebounce(query, 500);

      return useQuery({
        queryKey: buildSearchPublishedItemsKey({
          query: debouncedQuery,
          categories,
          isPublishedRoot,
          limit,
          sort,
        }),
        // todo: improve type
        queryFn: (): Promise<unknown> =>
          Api.searchPublishedItems(
            {
              attributesToCrop,
              categories,
              cropLength,
              isPublishedRoot,
              limit,
              query: debouncedQuery,
              sort,
            },
            queryConfig,
          ).then((data) => convertJs(data)),
        enabled,
        ...defaultQueryOptions,
      });
    },
  };
};

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
      query,
      categories,
      isPublishedRoot = false,
      limit,
      sort,
      enabled = true,
    }: {
      query?: string;
      categories?: Category['id'][][];
      isPublishedRoot?: boolean;
      enabled?: boolean;
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
            { query: debouncedQuery, categories, isPublishedRoot, limit, sort },
            queryConfig,
          ).then((data) => convertJs(data)),
        enabled,
        ...defaultQueryOptions,
      });
    },
  };
};

import { Category, convertJs } from '@graasp/sdk';
import { MeiliSearchResultsRecord } from '@graasp/sdk/frontend';

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
      highlightPreTag,
      highlightPostTag,
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
          highlightPreTag,
          highlightPostTag,
        }),
        // todo: improve type
        queryFn: () =>
          Api.searchPublishedItems(
            {
              attributesToCrop,
              categories,
              cropLength,
              isPublishedRoot,
              limit,
              query: debouncedQuery,
              sort,
              highlightPreTag,
              highlightPostTag,
            },
            queryConfig,
          ).then((data) => convertJs(data) as MeiliSearchResultsRecord),
        enabled,
        ...defaultQueryOptions,
      });
    },
  };
};

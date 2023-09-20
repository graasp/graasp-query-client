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
      page = 1,
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
          page,
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
              page,
            },
            queryConfig,
          ).then((data) => convertJs(data) as MeiliSearchResultsRecord),
        // we could add data in success, but not sure the data will be consistent with GET /item
        enabled,
        ...defaultQueryOptions,
      });
    },
  };
};

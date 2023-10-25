import { Category } from '@graasp/sdk';
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
      query,
      sort,
      highlightPreTag,
      highlightPostTag,
      page,
      limit,
      offset,
      elementsPerPage = 24,
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
          sort,
          highlightPreTag,
          highlightPostTag,
          page,
        }),
        queryFn: (): Promise<MeiliSearchResultsRecord> =>
          Api.searchPublishedItems(
            {
              attributesToCrop,
              categories,
              cropLength,
              isPublishedRoot,
              limit: page ? elementsPerPage : limit,
              offset: page ? elementsPerPage * (page - 1) : offset,
              query: debouncedQuery,
              sort,
              highlightPreTag,
              highlightPostTag,
            },
            queryConfig,
          ).then((data) => data),
        // we could add data in success, but not sure the data will be consistent with GET /item
        enabled,
        ...defaultQueryOptions,
      });
    },
  };
};

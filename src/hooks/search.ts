import { Category } from '@graasp/sdk';

import { useQuery } from '@tanstack/react-query';

import * as Api from '../api/search.js';
import { itemKeys } from '../config/keys.js';
import { QueryClientConfig } from '../types.js';
import useDebounce from './useDebounce.js';

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
        queryKey: itemKeys.publishedSearch({
          query: debouncedQuery,
          categories,
          isPublishedRoot,
          sort,
          highlightPreTag,
          highlightPostTag,
          page,
        }),
        queryFn: () =>
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
          ),
        // we could add data in success, but not sure the data will be consistent with GET /item
        enabled,
        ...defaultQueryOptions,
      });
    },
  };
};

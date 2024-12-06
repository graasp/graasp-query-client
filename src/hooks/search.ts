import { useQuery } from '@tanstack/react-query';

import * as Api from '../api/search.js';
import { facetKeys, itemKeys } from '../keys.js';
import { QueryClientConfig } from '../types.js';
import useDebounce from './useDebounce.js';

export default (queryConfig: QueryClientConfig) => {
  const { defaultQueryOptions } = queryConfig;

  // get search results
  return {
    useSearchPublishedItems: ({
      enabled,
      ...args
    }: {
      enabled?: boolean;
    } & Api.MeiliSearchProps) => {
      const debouncedQuery = useDebounce(args.query, 500);
      return useQuery({
        queryKey: itemKeys.search({
          ...args,
          query: debouncedQuery,
        }),
        queryFn: () => {
          const { page, limit, elementsPerPage = 24 } = args;
          return Api.searchPublishedItems(
            {
              isPublishedRoot: true,
              ...args,
              elementsPerPage,
              limit: page ? elementsPerPage : limit,
              query: debouncedQuery,
            },
            queryConfig,
          );
        },
        // we could add data in success, but not sure the data will be consistent with GET /item
        enabled,
        ...defaultQueryOptions,
      });
    },
    useSearchFacets: (args: { facetName: string } & Api.MeiliSearchProps) => {
      const debouncedQuery = useDebounce(args.query, 500);
      return useQuery({
        queryKey: facetKeys({
          ...args,
          query: debouncedQuery,
        }),
        queryFn: () => Api.getSearchFacets(args, queryConfig),
        ...defaultQueryOptions,
      });
    },
  };
};

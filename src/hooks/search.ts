import { Tag, TagCategory } from '@graasp/sdk';

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
      attributesToCrop,
      tags,
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
      langs,
    }: {
      enabled?: boolean;
      isPublishedRoot?: boolean;
      query?: string;
      langs?: string[];
      tags?: Record<TagCategory, Tag['name'][]>;
      // {
      //   discipline: Tag['name'][];
      //   level: Tag['name'][];
      //   resourceType: Tag['name'][];
      // };
    } & Api.MeiliSearchProps) => {
      const debouncedQuery = useDebounce(query, 500);
      return useQuery({
        queryKey: itemKeys.search({
          query: debouncedQuery,
          tags,
          isPublishedRoot,
          sort,
          highlightPreTag,
          highlightPostTag,
          page,
          langs,
        }),
        queryFn: () =>
          Api.searchPublishedItems(
            {
              attributesToCrop,
              tags,
              cropLength,
              isPublishedRoot,
              limit: page ? elementsPerPage : limit,
              offset: page ? elementsPerPage * (page - 1) : offset,
              query: debouncedQuery,
              sort,
              highlightPreTag,
              highlightPostTag,
              langs,
            },
            queryConfig,
          ),
        // we could add data in success, but not sure the data will be consistent with GET /item
        enabled,
        ...defaultQueryOptions,
      });
    },
    useSearchFacets: (args: { facetName: string; facetQuery?: string }) => {
      const debouncedFacetQuery = useDebounce(args.facetQuery, 500);
      return useQuery({
        queryKey: facetKeys({
          facetQuery: debouncedFacetQuery,
          facetName: args.facetName,
        }),
        queryFn: () => Api.getSearchFacets(args, queryConfig),
        enabled: Boolean(args.facetName),
        ...defaultQueryOptions,
      });
    },
  };
};

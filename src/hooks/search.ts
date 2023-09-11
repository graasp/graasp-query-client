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
    }: {
      query?: string;
      categories?: Category['id'][][];
      isPublishedRoot?: boolean;
    }) => {
      const debouncedQuery = useDebounce(query, 500);

      return useQuery({
        queryKey: buildSearchPublishedItemsKey(debouncedQuery, categories),
        queryFn: (): Promise<unknown> =>
          Api.searchPublishedItems(
            { query: debouncedQuery, categories, isPublishedRoot },
            queryConfig,
          ).then((data) => convertJs(data)),
        ...defaultQueryOptions,
        enabled: Boolean(debouncedQuery) || Boolean(categories?.length),
      });
    },
  };
};

import { Category, convertJs } from '@graasp/sdk';

import { useQuery } from 'react-query';

import * as Api from '../api';
import { buildSearchPublishedItemsKey } from '../config/keys';
import { QueryClientConfig } from '../types';

export default (queryConfig: QueryClientConfig) => {
  const { defaultQueryOptions } = queryConfig;

  // get search results
  return {
    useSearchPublishedItems: ({
      query,
      categories,
    }: {
      query?: string;
      categories?: Category['id'][][];
    }) =>
      useQuery({
        queryKey: buildSearchPublishedItemsKey(query, categories),
        queryFn: (): Promise<unknown> =>
          Api.searchPublishedItems({ query, categories }, queryConfig).then(
            (data) => convertJs(data),
          ),
        ...defaultQueryOptions,
        enabled: Boolean(query) || Boolean(categories?.length),
      }),
  };
};

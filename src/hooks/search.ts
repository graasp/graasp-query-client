import { Category, convertJs } from '@graasp/sdk';

import debounce from 'lodash.debounce';
import { useEffect, useState } from 'react';
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
    }) => {
      const [newQuery, setNewQuery] = useState(query);

      useEffect(() => {
        debounce(() => setNewQuery(query), 1000);
      }, [query]);

      return useQuery({
        queryKey: buildSearchPublishedItemsKey(newQuery, categories),
        queryFn: (): Promise<unknown> =>
          Api.searchPublishedItems(
            { query: newQuery, categories },
            queryConfig,
          ).then((data) => convertJs(data)),
        ...defaultQueryOptions,
        enabled: Boolean(newQuery) || Boolean(categories?.length),
      });
    },
  };
};

import { TagCategory } from '@graasp/sdk';

import { useQuery } from '@tanstack/react-query';

import useDebounce from '../hooks/useDebounce.js';
import { QueryClientConfig } from '../types.js';
import { getTags } from './api.js';
import { tagKeys } from './keys.js';

export default (queryConfig: QueryClientConfig) => {
  const { defaultQueryOptions } = queryConfig;

  return {
    useTags: ({
      search,
      category,
    }: {
      search?: string;
      category?: TagCategory;
    }) => {
      const debouncedSearch = useDebounce(search, 500);
      return useQuery({
        queryKey: tagKeys.search({
          search: debouncedSearch,
          category,
        }),
        queryFn: () =>
          getTags(
            {
              search: debouncedSearch,
              category,
            },
            queryConfig,
          ),
        enabled: Boolean(debouncedSearch),
        ...defaultQueryOptions,
      });
    },
  };
};

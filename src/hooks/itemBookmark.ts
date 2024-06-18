import { useQuery } from '@tanstack/react-query';

import * as Api from '../api/itemBookmark.js';
import { memberKeys } from '../keys.js';
import { QueryClientConfig } from '../types.js';

export default (queryConfig: QueryClientConfig) => {
  const { defaultQueryOptions } = queryConfig;

  const useBookmarkedItems = () =>
    useQuery({
      queryKey: memberKeys.current().bookmarkedItems,
      queryFn: () => Api.getBookmarkedItems(queryConfig),
      ...defaultQueryOptions,
    });

  return {
    useBookmarkedItems,
  };
};

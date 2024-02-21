import { useQuery } from 'react-query';

import * as Api from '../api/itemFavorite.js';
import { memberKeys } from '../config/keys.js';
import { QueryClientConfig } from '../types.js';

export default (queryConfig: QueryClientConfig) => {
  const { defaultQueryOptions } = queryConfig;

  const useFavoriteItems = () =>
    useQuery({
      queryKey: memberKeys.current().favoriteItems,
      queryFn: () => Api.getFavoriteItems(queryConfig),
      ...defaultQueryOptions,
    });

  return {
    useFavoriteItems,
  };
};

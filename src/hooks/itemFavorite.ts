import { useQuery } from 'react-query';

import * as Api from '../api';
import { FAVORITE_ITEMS_KEY } from '../config/keys';
import { QueryClientConfig } from '../types';

export default (queryConfig: QueryClientConfig) => {
  const { defaultQueryOptions } = queryConfig;

  const useFavoriteItems = () =>
    useQuery({
      queryKey: FAVORITE_ITEMS_KEY,
      queryFn: () => Api.getFavoriteItems(queryConfig),
      ...defaultQueryOptions,
    });

  return {
    useFavoriteItems,
  };
};

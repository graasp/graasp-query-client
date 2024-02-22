import { useQuery } from 'react-query';

import * as Api from '../api';
import { memberKeys } from '../config/keys';
import { QueryClientConfig } from '../types';

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

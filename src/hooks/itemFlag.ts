import { useQuery } from 'react-query';

import * as Api from '../api';
import { CONSTANT_KEY_CACHE_TIME_MILLISECONDS } from '../config/constants';
import { ITEM_FLAGS_KEY } from '../config/keys';
import { QueryClientConfig } from '../types';

export default (queryConfig: QueryClientConfig) => {
  const { defaultQueryOptions } = queryConfig;
  // get flag types
  const useFlags = () =>
    useQuery({
      queryKey: ITEM_FLAGS_KEY,
      queryFn: () => Api.getFlags(queryConfig).then((data) => data),
      ...defaultQueryOptions,
      cacheTime: CONSTANT_KEY_CACHE_TIME_MILLISECONDS,
    });

  return { useFlags };
};

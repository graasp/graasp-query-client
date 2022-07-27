import { useQuery } from 'react-query';
import { QueryClientConfig } from '../types';
import * as Api from '../api';
import { ITEM_FLAGS_KEY } from '../config/keys';
import { CONSTANT_KEY_CACHE_TIME_MILLISECONDS } from '../config/constants';
import { convertJs } from '../utils/util';

export default (queryConfig: QueryClientConfig) => {
  const { defaultQueryOptions } = queryConfig;
  // get flag types
  const useFlags = () =>
    useQuery({
      queryKey: ITEM_FLAGS_KEY,
      queryFn: () => Api.getFlags(queryConfig).then((data) => convertJs(data)),
      ...defaultQueryOptions,
      cacheTime: CONSTANT_KEY_CACHE_TIME_MILLISECONDS,
    });

  return { useFlags };
};

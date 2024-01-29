import { useQuery } from 'react-query';

import * as Api from '../api';
import { CONSTANT_KEY_STALE_TIME_MILLISECONDS } from '../config/constants';
import { APPS_KEY } from '../config/keys';
import { QueryClientConfig } from '../types';

export default (queryConfig: QueryClientConfig) => {
  const { defaultQueryOptions } = queryConfig;

  return {
    useApps: () =>
      useQuery({
        queryKey: APPS_KEY,
        queryFn: () => Api.getApps(queryConfig),
        ...defaultQueryOptions,
        staleTime: CONSTANT_KEY_STALE_TIME_MILLISECONDS,
      }),
  };
};

import { useQuery } from '@tanstack/react-query';

import * as Api from '../api/apps.js';
import { CONSTANT_KEY_STALE_TIME_MILLISECONDS } from '../config/constants.js';
import { APPS_KEY, memberKeys } from '../keys.js';
import { QueryClientConfig } from '../types.js';

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
    useMostUsedApps: () =>
      useQuery({
        queryKey: memberKeys.current().mostUsedApps,
        queryFn: () => Api.getMostUsedApps(queryConfig),
        ...defaultQueryOptions,
      }),
  };
};

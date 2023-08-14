import { convertJs } from '@graasp/sdk';
import { AppRecord } from '@graasp/sdk/frontend';

import { List } from 'immutable';
import { useQuery } from 'react-query';

import * as Api from '../api';
import { CONSTANT_KEY_CACHE_TIME_MILLISECONDS } from '../config/constants';
import { APPS_KEY } from '../config/keys';
import { QueryClientConfig } from '../types';

export default (queryConfig: QueryClientConfig) => {
  const { defaultQueryOptions } = queryConfig;

  return {
    useApps: () =>
      useQuery<List<AppRecord>, Error>({
        queryKey: APPS_KEY,
        queryFn: () => Api.getApps(queryConfig).then((data) => convertJs(data)),
        ...defaultQueryOptions,
        cacheTime: CONSTANT_KEY_CACHE_TIME_MILLISECONDS,
      }),
  };
};

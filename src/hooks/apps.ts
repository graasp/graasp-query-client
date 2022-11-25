import { useQuery } from '@tanstack/react-query';
import { List, RecordOf } from 'immutable';

import { convertJs } from '@graasp/sdk';

import * as Api from '../api';
import { CONSTANT_KEY_CACHE_TIME_MILLISECONDS } from '../config/constants';
import { APPS_KEY } from '../config/keys';
import { App, QueryClientConfig } from '../types';

export default (queryConfig: QueryClientConfig) => {
  const { defaultQueryOptions } = queryConfig;

  return {
    useApps: () =>
      useQuery<List<RecordOf<App>>, Error>({
        queryKey: APPS_KEY,
        queryFn: () => Api.getApps(queryConfig).then((data) => convertJs(data)),
        ...defaultQueryOptions,
        cacheTime: CONSTANT_KEY_CACHE_TIME_MILLISECONDS,
      }),
  };
};

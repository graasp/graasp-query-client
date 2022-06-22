import { List } from 'immutable';
import { useQuery } from 'react-query';
import * as Api from '../api';
import { APPS_KEY } from '../config/keys';
import { QueryClientConfig } from '../types';

export default (queryConfig: QueryClientConfig) => {
  const { defaultQueryOptions } = queryConfig;

  return {
    useApps: () =>
      useQuery({
        queryKey: APPS_KEY,
        queryFn: () => Api.getApps(queryConfig).then((data) => List(data)),
        ...defaultQueryOptions,
      }),
  };
};

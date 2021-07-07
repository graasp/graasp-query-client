import { useQuery } from 'react-query';
import { List } from 'immutable';
import { QueryClientConfig } from '../types';
import * as Api from '../api';
import { ITEM_FLAGS } from '../config/keys';

export default (queryConfig: QueryClientConfig) => {
  const { retry, cacheTime, staleTime } = queryConfig;
  const defaultOptions = {
    retry,
    cacheTime,
    staleTime,
  };

  const useFlags = () =>
    useQuery({
      queryKey: ITEM_FLAGS,
      queryFn: () => Api.getFlags(queryConfig).then((data) => List(data)),
      ...defaultOptions,
    });

  return { useFlags };
};

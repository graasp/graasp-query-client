import { useQuery } from 'react-query';
import { List } from 'immutable';
import { QueryClientConfig } from '../types';
import * as Api from '../api';
import { ITEM_FLAGS_KEY } from '../config/keys';

export default (queryConfig: QueryClientConfig) => {
  const { defaultQueryOptions } = queryConfig;
  // get flag types
  const useFlags = () =>
    useQuery({
      queryKey: ITEM_FLAGS_KEY,
      queryFn: () => Api.getFlags(queryConfig).then((data) => List(data)),
      ...defaultQueryOptions,
    });

  return { useFlags };
};

import { useQuery } from 'react-query';
import { List } from 'immutable';
import { QueryClientConfig, UUID } from '../types';
import * as Api from '../api';
import { buildCustomizedTagsKey } from '../config/keys';

export default (queryConfig: QueryClientConfig) => {
  const { retry, cacheTime, staleTime } = queryConfig;
  const defaultOptions = {
    retry,
    cacheTime,
    staleTime,
  };

  // get flag types
  const useCustomizedTags = (itemId: UUID ) =>
    useQuery({
      queryKey: buildCustomizedTagsKey(itemId),
      queryFn: () => Api.getCustomizedTags(itemId, queryConfig).then((data) => List(data)),
      ...defaultOptions,
      enabled: Boolean(itemId),
    });

  return { useCustomizedTags };
};

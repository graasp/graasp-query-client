import { useQuery } from 'react-query';
import { List } from 'immutable';
import { QueryClientConfig } from '../types';
import * as Api from '../api';
import { buildSearchByKeywordKey } from '../config/keys';

export default (queryConfig: QueryClientConfig) => {
  const { retry, cacheTime, staleTime } = queryConfig;
  const defaultOptions = {
    retry,
    cacheTime,
    staleTime,
  };

  // get search results
  const useKeywordSearch = (range: string, keywords: string) =>
    useQuery({
      queryKey: buildSearchByKeywordKey(range, keywords),
      queryFn: () => Api.getItemsByKeywords(range, keywords, queryConfig).then((data) => List(data)),
      ...defaultOptions,
      enabled: Boolean(range) && Boolean(keywords),
    });

  return { useKeywordSearch };
};

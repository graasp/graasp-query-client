import { useQuery } from 'react-query';
import { QueryClientConfig } from '../types';
import * as Api from '../api';
import { buildSearchByKeywordKey } from '../config/keys';
import { convertJs } from '../utils/util';

export default (queryConfig: QueryClientConfig) => {
  const { defaultQueryOptions } = queryConfig;

  // get search results
  const useKeywordSearch = (range: string, keywords: string) =>
    useQuery({
      queryKey: buildSearchByKeywordKey(range, keywords),
      queryFn: () =>
        Api.getItemsByKeywords(range, keywords, queryConfig).then((data) =>
          convertJs(data),
        ),
      ...defaultQueryOptions,
      enabled: Boolean(range) && Boolean(keywords),
    });

  return { useKeywordSearch };
};

import { useQuery } from 'react-query';

import { convertJs } from '@graasp/sdk';

import * as Api from '../api';
import { buildSearchByKeywordKey } from '../config/keys';
import { QueryClientConfig } from '../types';

export default (queryConfig: QueryClientConfig) => {
  const { defaultQueryOptions } = queryConfig;

  // get search results
  return {
    useKeywordSearch: (range: string, keywords: string) =>
      useQuery({
        queryKey: buildSearchByKeywordKey(range, keywords),
        queryFn: () =>
          Api.getItemsByKeywords(range, keywords, queryConfig).then((data) =>
            convertJs(data),
          ),
        ...defaultQueryOptions,
        enabled: Boolean(range) && Boolean(keywords),
      }),
  };
};

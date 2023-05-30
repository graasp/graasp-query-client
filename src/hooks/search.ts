import { useQuery } from 'react-query';

import { convertJs } from '@graasp/sdk';

import * as Api from '../api';
import { buildSearchByKeywordKey } from '../config/keys';
import { QueryClientConfig, SearchFields } from '../types';

export default (queryConfig: QueryClientConfig) => {
  const { defaultQueryOptions } = queryConfig;

  // get search results
  return {
    useKeywordSearch: (fields: SearchFields) =>
      useQuery({
        queryKey: buildSearchByKeywordKey(fields),
        queryFn: () =>
          Api.getItemsByKeywords(fields, queryConfig).then((data) =>
            convertJs(data),
          ),
        ...defaultQueryOptions,
        enabled: Boolean(fields),
      }),
  };
};

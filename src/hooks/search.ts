import { convertJs } from '@graasp/sdk';
import { ItemRecord } from '@graasp/sdk/frontend';

import { List } from 'immutable';
import { useQuery } from 'react-query';

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
        queryFn: (): Promise<List<ItemRecord>> =>
          Api.getItemsByKeywords(fields, queryConfig).then((data) =>
            convertJs(data),
          ),
        ...defaultQueryOptions,
        enabled: Object.values(fields).some((v) => v),
      }),
  };
};

import { convertJs } from '@graasp/sdk';
import { ItemFavoriteRecord } from '@graasp/sdk/frontend';

import { List } from 'immutable';
import { useQuery } from 'react-query';

import * as Api from '../api';
import { FAVORITE_ITEMS_KEY } from '../config/keys';
import { QueryClientConfig } from '../types';

export default (queryConfig: QueryClientConfig) => {
  const { defaultQueryOptions } = queryConfig;

  const useFavoriteItems = () =>
    useQuery({
      queryKey: FAVORITE_ITEMS_KEY,
      queryFn: (): Promise<List<ItemFavoriteRecord>> =>
        Api.getFavoriteItems(queryConfig).then((data) => convertJs(data)),
      ...defaultQueryOptions,
    });

  return {
    useFavoriteItems,
  };
};

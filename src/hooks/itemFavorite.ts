import { List } from 'immutable';
import { useQuery } from 'react-query';

import { convertJs } from '@graasp/sdk';
import { ItemFavoriteRecord } from '@graasp/sdk/frontend';

import * as Api from '../api';
import {
  FAVORITE_ITEMS_KEY,
} from '../config/keys';
import { QueryClientConfig } from '../types';

export default (queryConfig: QueryClientConfig) => {
  const { defaultQueryOptions } = queryConfig;

  const useFavoriteItems = () =>
    useQuery<List<ItemFavoriteRecord>, Error>({
      queryKey: FAVORITE_ITEMS_KEY,
      queryFn: () =>
        Api.getFavoriteItems(queryConfig).then((data) => convertJs(data)),
      ...defaultQueryOptions,
    });

  return {
    useFavoriteItems
  };
};

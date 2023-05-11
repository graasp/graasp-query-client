import {Item, UUID} from '@graasp/sdk';

import { QueryClientConfig } from '../types';
import configureAxios, { verifyAuthentication } from './axios';
import {
  GET_FAVORITE_ITEMS_ROUTE, buildFavoriteItemRoute
} from './routes';

const axios = configureAxios();


export const getFavoriteItems = async ({ API_HOST }: QueryClientConfig): Promise<Item[]> =>
  verifyAuthentication(() =>
    axios
      .get(`${API_HOST}/${GET_FAVORITE_ITEMS_ROUTE}`)
      .then(({ data }) => data),
  );

export const favoriteItem = async (
  id: UUID,
  { API_HOST }: QueryClientConfig,
) =>
  verifyAuthentication(() =>
    axios
      .post(`${API_HOST}/${buildFavoriteItemRoute(id)}`)
      .then(({ data }) => data),
  );

export const unfavoriteItem = async (
  id: UUID,
  { API_HOST }: QueryClientConfig,
) =>
  verifyAuthentication(() =>
    axios
      .delete(`${API_HOST}/${buildFavoriteItemRoute(id)}`)
      .then(({ data }) => data),
  );

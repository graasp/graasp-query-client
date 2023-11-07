import { ItemFavorite, UUID } from '@graasp/sdk';

import { PartialQueryConfigForApi } from '../types';
import { verifyAuthentication } from './axios';
import { GET_FAVORITE_ITEMS_ROUTE, buildFavoriteItemRoute } from './routes';

export const getFavoriteItems = async ({
  API_HOST,
  axios,
}: PartialQueryConfigForApi) =>
  verifyAuthentication(() =>
    axios
      .get<ItemFavorite[]>(`${API_HOST}/${GET_FAVORITE_ITEMS_ROUTE}`)
      .then(({ data }) => data),
  );

export const addFavoriteItem = async (
  id: UUID,
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  verifyAuthentication(() =>
    axios
      .post<ItemFavorite>(`${API_HOST}/${buildFavoriteItemRoute(id)}`)
      .then(({ data }) => data),
  );

export const removeFavoriteItem = async (
  id: UUID,
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  verifyAuthentication(() =>
    axios
      .delete<UUID>(`${API_HOST}/${buildFavoriteItemRoute(id)}`)
      .then(({ data }) => data),
  );

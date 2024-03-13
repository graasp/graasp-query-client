import { ItemBookmark, UUID } from '@graasp/sdk';

import { PartialQueryConfigForApi } from '../types.js';
import { verifyAuthentication } from './axios.js';
import {
  GET_BOOKMARKED_ITEMS_ROUTE,
  buildBookmarkedItemRoute,
} from './routes.js';

export const getBookmarkedItems = async ({
  API_HOST,
  axios,
}: PartialQueryConfigForApi) =>
  verifyAuthentication(() =>
    axios
      .get<ItemBookmark[]>(`${API_HOST}/${GET_BOOKMARKED_ITEMS_ROUTE}`)
      .then(({ data }) => data),
  );

export const addBookmarkedItem = async (
  id: UUID,
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  verifyAuthentication(() =>
    axios
      .post<ItemBookmark>(`${API_HOST}/${buildBookmarkedItemRoute(id)}`)
      .then(({ data }) => data),
  );

export const removeBookmarkedItem = async (
  id: UUID,
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  verifyAuthentication(() =>
    axios
      .delete<UUID>(`${API_HOST}/${buildBookmarkedItemRoute(id)}`)
      .then(({ data }) => data),
  );

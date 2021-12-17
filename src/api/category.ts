import { QueryClientConfig, UUID } from '../types';
import configureAxios, {
  fallbackToPublic,
  verifyAuthentication,
} from './axios';
import {
  buildGetCategoriesRoute,
  buildGetItemCategoriesRoute,
  buildGetItemsInCategoryRoute,
  buildPostItemCategoryRoute,
  buildDeleteItemCategoryRoute,
  GET_CATEGORY_TYPES_ROUTE,
  buildGetPublicItemCategoriesRoute,
  buildGetCategoryRoute,
} from './routes';

const axios = configureAxios();

export const getCategoryTypes = async ({ API_HOST }: QueryClientConfig) =>
  axios.get(`${API_HOST}/${GET_CATEGORY_TYPES_ROUTE}`).then(({ data }) => data);

export const getCategories = async (
  { API_HOST }: QueryClientConfig,
  typeIds?: UUID[],
) =>
  axios
    .get(`${API_HOST}/${buildGetCategoriesRoute(typeIds)}`)
    .then(({ data }) => data);

export const getCategory = async (
  categoryId: UUID,
  { API_HOST }: QueryClientConfig,
) =>
  axios
    .get(`${API_HOST}/${buildGetCategoryRoute(categoryId)}`)
    .then(({ data }) => data);

export const getItemCategories = async (
  itemId: UUID,
  { API_HOST }: QueryClientConfig,
) =>
  fallbackToPublic(
    () => axios.get(`${API_HOST}/${buildGetItemCategoriesRoute(itemId)}`),
    () => axios.get(`${API_HOST}/${buildGetPublicItemCategoriesRoute(itemId)}`),
  );

export const getItemsForCategories = async (
  categoryIds: UUID[],
  { API_HOST }: QueryClientConfig,
) =>
  axios
    .get(`${API_HOST}/${buildGetItemsInCategoryRoute(categoryIds)}`)
    .then(({ data }) => data);

// payload: itemId, categoryId
export const postItemCategory = async (
  { itemId, categoryId }: { itemId: UUID; categoryId: UUID },
  { API_HOST }: QueryClientConfig,
) =>
  verifyAuthentication(() =>
    axios
      .post(`${API_HOST}/${buildPostItemCategoryRoute(itemId)}`, {
        itemId,
        categoryId,
      })
      .then(({ data }) => data),
  );

export const deleteItemCategory = async (
  entryId: UUID,
  { API_HOST }: QueryClientConfig,
) =>
  verifyAuthentication(() =>
    axios
      .delete(`${API_HOST}/${buildDeleteItemCategoryRoute(entryId)}`)
      .then(({ data }) => data),
  );

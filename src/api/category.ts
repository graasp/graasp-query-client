import { Category, CategoryType, ItemCategory, UUID } from '@graasp/sdk';

import { PartialQueryConfigForApi } from '../types';
import { verifyAuthentication } from './axios';
import {
  GET_CATEGORY_TYPES_ROUTE,
  buildDeleteItemCategoryRoute,
  buildGetCategoriesRoute,
  buildGetCategoryRoute,
  buildGetItemCategoriesRoute,
  buildGetItemsInCategoryRoute,
  buildPostItemCategoryRoute,
} from './routes';

export const getCategoryTypes = async ({
  API_HOST,
  axios,
}: PartialQueryConfigForApi): Promise<CategoryType[]> =>
  axios.get(`${API_HOST}/${GET_CATEGORY_TYPES_ROUTE}`).then(({ data }) => data);

export const getCategories = async (
  { API_HOST, axios }: PartialQueryConfigForApi,
  typeIds?: UUID[],
): Promise<Category[]> =>
  axios
    .get(`${API_HOST}/${buildGetCategoriesRoute(typeIds)}`)
    .then(({ data }) => data);

export const getCategory = async (
  categoryId: UUID,
  { API_HOST, axios }: PartialQueryConfigForApi,
): Promise<Category> =>
  axios
    .get(`${API_HOST}/${buildGetCategoryRoute(categoryId)}`)
    .then(({ data }) => data);

export const getItemCategories = async (
  itemId: UUID,
  { API_HOST, axios }: PartialQueryConfigForApi,
): Promise<ItemCategory[]> =>
  axios
    .get(`${API_HOST}/${buildGetItemCategoriesRoute(itemId)}`)
    .then(({ data }) => data);

export const buildGetItemsForCategoriesRoute = async (
  categoryIds: UUID[],
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  axios
    .get(`${API_HOST}/${buildGetItemsInCategoryRoute(categoryIds)}`)
    .then(({ data }) => data);

// payload: itemId, categoryId
export const postItemCategory = async (
  { itemId, categoryId }: { itemId: UUID; categoryId: UUID },
  { API_HOST, axios }: PartialQueryConfigForApi,
): Promise<ItemCategory> =>
  verifyAuthentication(() =>
    axios
      .post(`${API_HOST}/${buildPostItemCategoryRoute(itemId)}`, {
        categoryId,
      })
      .then(({ data }) => data),
  );

export const deleteItemCategory = async (
  args: { itemCategoryId: UUID; itemId: UUID },
  { API_HOST, axios }: PartialQueryConfigForApi,
): Promise<ItemCategory> =>
  verifyAuthentication(() =>
    axios
      .delete(`${API_HOST}/${buildDeleteItemCategoryRoute(args)}`)
      .then(({ data }) => data),
  );

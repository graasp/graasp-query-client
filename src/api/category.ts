import {
  Category,
  CategoryType,
  DiscriminatedItem,
  ItemCategory,
  UUID,
} from '@graasp/sdk';

import { PartialQueryConfigForApi } from '../types.js';
import { verifyAuthentication } from './axios.js';
import {
  GET_CATEGORY_TYPES_ROUTE,
  buildDeleteItemCategoryRoute,
  buildGetCategoriesRoute,
  buildGetCategoryRoute,
  buildGetItemCategoriesRoute,
  buildGetItemsInCategoryRoute,
  buildPostItemCategoryRoute,
} from './routes.js';

export const getCategoryTypes = async ({
  API_HOST,
  axios,
}: PartialQueryConfigForApi) =>
  axios
    .get<CategoryType[]>(`${API_HOST}/${GET_CATEGORY_TYPES_ROUTE}`)
    .then(({ data }) => data);

export const getCategories = async (
  { API_HOST, axios }: PartialQueryConfigForApi,
  typeIds?: UUID[],
) =>
  axios
    .get<Category[]>(`${API_HOST}/${buildGetCategoriesRoute(typeIds)}`)
    .then(({ data }) => data);

export const getCategory = async (
  categoryId: UUID,
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  axios
    .get<Category>(`${API_HOST}/${buildGetCategoryRoute(categoryId)}`)
    .then(({ data }) => data);

export const getItemCategories = async (
  itemId: UUID,
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  axios
    .get<ItemCategory[]>(`${API_HOST}/${buildGetItemCategoriesRoute(itemId)}`)
    .then(({ data }) => data);

export const buildGetItemsForCategoriesRoute = async (
  categoryIds: UUID[],
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  axios
    .get<
      DiscriminatedItem[]
    >(`${API_HOST}/${buildGetItemsInCategoryRoute(categoryIds)}`)
    .then(({ data }) => data);

// payload: itemId, categoryId
export const postItemCategory = async (
  { itemId, categoryId }: { itemId: UUID; categoryId: UUID },
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  verifyAuthentication(() =>
    axios
      .post<ItemCategory>(`${API_HOST}/${buildPostItemCategoryRoute(itemId)}`, {
        categoryId,
      })
      .then(({ data }) => data),
  );

export const deleteItemCategory = async (
  args: { itemCategoryId: UUID; itemId: UUID },
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  verifyAuthentication(() =>
    axios
      .delete<ItemCategory>(`${API_HOST}/${buildDeleteItemCategoryRoute(args)}`)
      .then(({ data }) => data),
  );

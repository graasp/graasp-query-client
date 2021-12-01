import { QueryClientConfig, UUID} from '../types';
import { buildGetCategoriesRoute, buildGetCategoryInfoRoute, buildGetItemCategoriesRoute, 
  buildGetItemsInCategoryRoute, buildPostItemCategoryRoute, buildDeleteItemCategoryRoute, GET_CATEGORY_TYPES_ROUTE } from './routes';
import { DEFAULT_DELETE, DEFAULT_GET, DEFAULT_POST, failOnError } from './utils';

export const getCategoryTypes = async ({ API_HOST }: QueryClientConfig) => {
  const res = await fetch(`${API_HOST}/${GET_CATEGORY_TYPES_ROUTE}`, DEFAULT_GET).then(
    failOnError,
  );

  return res.json();
};

export const getCategories = async ({ API_HOST }: QueryClientConfig, typeIds?: UUID[], ) => {
  const res = await fetch(`${API_HOST}/${buildGetCategoriesRoute(typeIds)}`, DEFAULT_GET).then(
    failOnError,
  );

  return res.json();
};

export const getCategory = async (categoryId: UUID, { API_HOST }: QueryClientConfig) => {
    const res = await fetch(`${API_HOST}/${buildGetCategoryInfoRoute(categoryId)}`, DEFAULT_GET).then(
      failOnError,
    );
  
    return res.json();
  };

export const getItemCategories = async (itemId: UUID, { API_HOST }: QueryClientConfig) => {
    const res = await fetch(`${API_HOST}/${buildGetItemCategoriesRoute(itemId)}`, DEFAULT_GET).then(
      failOnError,
    );
    return res.json();
  };

export const getItemsForCategories = async (categoryIds: UUID[], { API_HOST }: QueryClientConfig) => {
    const res = await fetch(`${API_HOST}/${buildGetItemsInCategoryRoute(categoryIds)}`, DEFAULT_GET).then(
      failOnError,
    );
  
    return res.json();
  };

// payload: itemId, categoryId
export const postItemCategory = async (
  {
    itemId,
    categoryId,
  }: { itemId: UUID; categoryId: UUID },
  { API_HOST }: QueryClientConfig,
) => {
  const res = await fetch(`${API_HOST}/${buildPostItemCategoryRoute(itemId)}`, {
    ...DEFAULT_POST,
    body: JSON.stringify({ itemId, categoryId }),
  }).then(failOnError);

  return res.json();
};

export const deleteItemCategory = async (entryId: UUID, { API_HOST }: QueryClientConfig) => {
  const res = await fetch(`${API_HOST}/${buildDeleteItemCategoryRoute(entryId)}`, {
    ...DEFAULT_DELETE,
  }).then(failOnError);

  return res.json();
};
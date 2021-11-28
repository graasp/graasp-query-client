import { QueryClientConfig, UUID} from '../types';
import { buildGetCategoriesRoute, buildGetCategoryInfoRoute, buildGetItemCategoryRoute, 
  buildGetItemsInCategoryRoute, buildPostItemCategoryRoute, buildDeleteItemCategoryRoute, GET_CATEGORY_TYPES_ROUTE } from './routes';
import { DEFAULT_DELETE, DEFAULT_GET, DEFAULT_POST, failOnError } from './utils';

export const getCategoryTypes = async ({ API_HOST }: QueryClientConfig) => {
  const res = await fetch(`${API_HOST}/${GET_CATEGORY_TYPES_ROUTE}`, DEFAULT_GET).then(
    failOnError,
  );

  return res.json();
};

export const getCategories = async (typeId: UUID[], { API_HOST }: QueryClientConfig) => {
  console.log(typeId);
  console.log(buildGetCategoriesRoute(typeId));
  const res = await fetch(`${API_HOST}/${buildGetCategoriesRoute(typeId)}`, DEFAULT_GET).then(
    failOnError,
  );

  return res.json();
};

export const getCategoryInfo = async (categoryId: UUID, { API_HOST }: QueryClientConfig) => {
    const res = await fetch(`${API_HOST}/${buildGetCategoryInfoRoute(categoryId)}`, DEFAULT_GET).then(
      failOnError,
    );
  
    return res.json();
  };

export const getItemCategory = async (itemId: UUID, { API_HOST }: QueryClientConfig) => {
    const res = await fetch(`${API_HOST}/${buildGetItemCategoryRoute(itemId)}`, DEFAULT_GET).then(
      failOnError,
    );
    return res.json();
  };

export const getItemsInCategory = async (categoryId: UUID[], { API_HOST }: QueryClientConfig) => {
    const res = await fetch(`${API_HOST}/${buildGetItemsInCategoryRoute(categoryId)}`, DEFAULT_GET).then(
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
  console.log(JSON.stringify({itemId, categoryId}));
  const res = await fetch(`${API_HOST}/${buildPostItemCategoryRoute(itemId)}`, {
    ...DEFAULT_POST,
    body: JSON.stringify({ itemId, categoryId }),
  }).then(failOnError);

  return res.json();
};

export const deleteItemCategory = async (itemId: UUID, { API_HOST }: QueryClientConfig) => {
  const res = await fetch(`${API_HOST}/${buildDeleteItemCategoryRoute(itemId)}`, {
    ...DEFAULT_DELETE,
  }).then(failOnError);

  return res.json();
};
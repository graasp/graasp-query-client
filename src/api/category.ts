import { QueryClientConfig, UUID} from '../types';
import { GET_CATEGORY_AGE_ROUTE, GET_CATEGORY_DISCIPLINE_ROUTE, GET_CATEGORY_NAME_AGE_ROUTE, GET_ITEMS_IN_CATEGORY_ROUTE, GET_ITEM_CATEGORY_ROUTE } from './routes';
import { DEFAULT_GET, failOnError } from './utils';

export const getCategoriesAge = async ({ API_HOST }: QueryClientConfig) => {
  const res = await fetch(`${API_HOST}/${GET_CATEGORY_AGE_ROUTE}`, DEFAULT_GET).then(
    failOnError,
  );

  return res.json();
};

export const getCategoriesDiscipline = async ({ API_HOST }: QueryClientConfig) => {
    const res = await fetch(`${API_HOST}/${GET_CATEGORY_DISCIPLINE_ROUTE}`, DEFAULT_GET).then(
      failOnError,
    );
  
    return res.json();
  };

export const getCategoryNameAge = async (categoryId: string, { API_HOST }: QueryClientConfig) => {
    const res = await fetch(`${API_HOST}/${GET_CATEGORY_NAME_AGE_ROUTE(categoryId)}`, DEFAULT_GET).then(
      failOnError,
    );
  
    return res.json();
  };

export const getCategoryNameDiscipline = async (categoryId: string, { API_HOST }: QueryClientConfig) => {
    const res = await fetch(`${API_HOST}/${GET_CATEGORY_NAME_AGE_ROUTE(categoryId)}`, DEFAULT_GET).then(
      failOnError,
    );
  
    return res.json();
  };

export const getItemCategory = async (itemId: UUID, { API_HOST }: QueryClientConfig) => {
    const res = await fetch(`${API_HOST}/${GET_ITEM_CATEGORY_ROUTE(itemId)}`, DEFAULT_GET).then(
      failOnError,
    );
    return res.json();
  };

export const getItemsInCategory = async (categoryName: string, categoryId: string, { API_HOST }: QueryClientConfig) => {
    const res = await fetch(`${API_HOST}/${GET_ITEMS_IN_CATEGORY_ROUTE(categoryName, categoryId)}`, DEFAULT_GET).then(
      failOnError,
    );
  
    return res.json();
  };
import { QueryClientConfig} from '../types';
import { GET_CATEGORY_AGE_ROUTE, GET_CATEGORY_DISCIPLINE_ROUTE } from './routes';
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
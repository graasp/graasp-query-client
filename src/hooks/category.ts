import { useQuery } from 'react-query';
import { List } from 'immutable';
import { QueryClientConfig } from '../types';
import * as Api from '../api';
import { CATEGORY_AGE_KEY, CATEGORY_DISCIPLINE_KEY } from '../config/keys';

export default (queryConfig: QueryClientConfig) => {
  const { retry, cacheTime, staleTime } = queryConfig;
  const defaultOptions = {
    retry,
    cacheTime,
    staleTime,
  };

  // get age categories
  const useCategoryAge = () =>
    useQuery({
      queryKey: CATEGORY_AGE_KEY,
      queryFn: () => Api.getCategoriesAge(queryConfig).then((data) => List(data)),
      ...defaultOptions,
    });

  // get flag types
  const useCategoryDiscipline = () =>
    useQuery({
      queryKey: CATEGORY_DISCIPLINE_KEY,
      queryFn: () => Api.getCategoriesDiscipline(queryConfig).then((data) => List(data)),
      ...defaultOptions,
    });

  return { useCategoryAge, useCategoryDiscipline };
};

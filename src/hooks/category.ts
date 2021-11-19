import { useQuery } from 'react-query';
import { List } from 'immutable';
import { QueryClientConfig, UUID } from '../types';
import * as Api from '../api';
import { CATEGORY_AGE_KEY, CATEGORY_DISCIPLINE_KEY, CATEGORY_NAME_AGE, CATEGORY_NAME_DISCIPLINE, itemCategoryKey, ITEMS_IN_CATEGORY } from '../config/keys';

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

  // get discipline categories
  const useCategoryDiscipline = () =>
    useQuery({
      queryKey: CATEGORY_DISCIPLINE_KEY,
      queryFn: () => Api.getCategoriesDiscipline(queryConfig).then((data) => List(data)),
      ...defaultOptions,
    });

  const useCategoryNameAge = (categoryId: string) =>
    useQuery({
      queryKey: CATEGORY_NAME_AGE,
      queryFn: () => Api.getCategoryNameAge(categoryId ,queryConfig).then((data) => (data)),
      ...defaultOptions,
    });

  const useCategoryNameDiscipline = (categoryId: string) =>
    useQuery({
      queryKey: CATEGORY_NAME_DISCIPLINE,
      queryFn: () => Api.getCategoryNameDiscipline(categoryId, queryConfig).then((data) => (data)),
      ...defaultOptions,
    });

  const useItemCategory = (itemId: UUID) =>
    useQuery({
      queryKey: itemCategoryKey(itemId),
      queryFn: () => Api.getItemCategory(itemId, queryConfig).then((data) => (data)),
      ...defaultOptions,
      enabled: Boolean(itemId),
    });

  const useItemsInCategory = (categoryName: string, categoryId: string) =>
    useQuery({
      queryKey: ITEMS_IN_CATEGORY,
      queryFn: () => Api.getItemsInCategory(categoryName, categoryId, queryConfig).then((data) => List(data)),
      ...defaultOptions,
    });

  return { useCategoryAge, useCategoryDiscipline, useCategoryNameAge, useCategoryNameDiscipline, useItemCategory,
          useItemsInCategory };
};

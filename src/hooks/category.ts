import { useQuery } from 'react-query';
import { List } from 'immutable';
import { QueryClientConfig, UUID } from '../types';
import * as Api from '../api';
import { buildItemCategoryKey, buildItemsByCategoryKey, buildCategoriesKey, CATEGORY_INFO, CATEGORY_TYPES_KEY } from '../config/keys';

export default (queryConfig: QueryClientConfig) => {
  const { retry, cacheTime, staleTime } = queryConfig;
  const defaultOptions = {
    retry,
    cacheTime,
    staleTime,
  };
  
  // get category types
  const useCategoryTypes = () =>
    useQuery({
      queryKey: CATEGORY_TYPES_KEY,
      queryFn: () => Api.getCategoryTypes(queryConfig).then((data) => List(data)),
      ...defaultOptions,
    });

  // get categories
  const useCategories = (typeId?: UUID[]) =>
    useQuery({
      queryKey: buildCategoriesKey(typeId),
      queryFn: () => Api.getCategories(queryConfig, typeId).then((data) => List(data)),
      ...defaultOptions,
    });

  const useCategory = (categoryId: UUID) =>
    useQuery({
      queryKey: CATEGORY_INFO,
      queryFn: () => Api.getCategory(categoryId ,queryConfig).then((data) => (data)),
      ...defaultOptions,
    });

  const useItemCategories = (itemId: UUID) =>
    useQuery({
      queryKey: buildItemCategoryKey(itemId),
      queryFn: () => Api.getItemCategories(itemId, queryConfig).then((data) => List(data)),
      ...defaultOptions,
      enabled: Boolean(itemId),
    });

  const useItemsInCategories = (categoryIds: UUID[]) =>
    useQuery({
      queryKey: buildItemsByCategoryKey(categoryIds),
      queryFn: () => Api.getItemsForCategories(categoryIds, queryConfig).then((data) => List(data)),
      ...defaultOptions,
    });

  return { useCategoryTypes, useCategories, useCategory, useItemCategories, useItemsInCategories };
};

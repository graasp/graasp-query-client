import { useQuery } from 'react-query';
import { List } from 'immutable';
import { QueryClientConfig, UUID } from '../types';
import * as Api from '../api';
import { buildCategoriesKey, CATEGORY_TYPES_KEY, buildCategoryKey, buildItemCategoriesKey, buildItemsByCategoriesKey } from '../config/keys';

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
  const useCategories = (typeIds?: UUID[]) =>
    useQuery({
      queryKey: buildCategoriesKey(typeIds),
      queryFn: () => Api.getCategories(queryConfig, typeIds).then((data) => List(data)),
      ...defaultOptions,
    });

  const useCategory = (categoryId: UUID) =>
    useQuery({
      queryKey: buildCategoryKey(categoryId),
      queryFn: () => Api.getCategory(categoryId ,queryConfig).then((data) => (data)),
      ...defaultOptions,
    });

  const useItemCategories = (itemId: UUID) =>
    useQuery({
      queryKey: buildItemCategoriesKey(itemId),
      queryFn: () => Api.getItemCategories(itemId, queryConfig).then((data) => List(data)),
      ...defaultOptions,
      enabled: Boolean(itemId),
    });

  const useItemsInCategories = (categoryIds: UUID[]) =>
    useQuery({
      queryKey: buildItemsByCategoriesKey(categoryIds),
      queryFn: () => Api.getItemsForCategories(categoryIds, queryConfig).then((data) => List(data)),
      ...defaultOptions,
      enabled: Boolean(categoryIds),
    });

  return { useCategoryTypes, useCategories, useCategory, useItemCategories, useItemsInCategories };
};

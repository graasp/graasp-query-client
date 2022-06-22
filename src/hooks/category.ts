import { useQuery } from 'react-query';
import { List } from 'immutable';
import { QueryClientConfig, UUID } from '../types';
import * as Api from '../api';
import {
  buildCategoriesKey,
  CATEGORY_TYPES_KEY,
  buildCategoryKey,
  buildItemCategoriesKey,
  buildItemsByCategoriesKey,
} from '../config/keys';

export default (queryConfig: QueryClientConfig) => {
  const { defaultQueryOptions } = queryConfig;

  // get category types
  const useCategoryTypes = () =>
    useQuery({
      queryKey: CATEGORY_TYPES_KEY,
      queryFn: () =>
        Api.getCategoryTypes(queryConfig).then((data) => List(data)),
      ...defaultQueryOptions,
    });

  // get categories
  const useCategories = (typeIds?: UUID[]) =>
    useQuery({
      queryKey: buildCategoriesKey(typeIds),
      queryFn: () =>
        Api.getCategories(queryConfig, typeIds).then((data) => List(data)),
      ...defaultQueryOptions,
    });

  const useCategory = (categoryId: UUID) =>
    useQuery({
      queryKey: buildCategoryKey(categoryId),
      queryFn: () =>
        Api.getCategory(categoryId, queryConfig).then((data) => data),
      ...defaultQueryOptions,
    });

  const useItemCategories = (itemId: UUID) =>
    useQuery({
      queryKey: buildItemCategoriesKey(itemId),
      queryFn: () =>
        Api.getItemCategories(itemId, queryConfig).then((data) => List(data)),
      ...defaultQueryOptions,
      enabled: Boolean(itemId),
    });

  const useItemsInCategories = (categoryIds: UUID[]) =>
    useQuery({
      queryKey: buildItemsByCategoriesKey(categoryIds),
      queryFn: () =>
        Api.buildGetItemsForCategoriesRoute(categoryIds, queryConfig).then(
          (data) => List(data),
        ),
      ...defaultQueryOptions,
      enabled: Boolean(categoryIds),
    });

  return {
    useCategoryTypes,
    useCategories,
    useCategory,
    useItemCategories,
    useItemsInCategories,
  };
};

import { useQuery } from 'react-query';
import { QueryClientConfig, UUID } from '../types';
import * as Api from '../api';
import {
  buildCategoriesKey,
  CATEGORY_TYPES_KEY,
  buildCategoryKey,
  buildItemCategoriesKey,
  buildItemsByCategoriesKey,
} from '../config/keys';
import { CONSTANT_KEY_CACHE_TIME_MILLISECONDS } from '../config/constants';
import { convertJs } from '../utils/util';

export default (queryConfig: QueryClientConfig) => {
  const { defaultQueryOptions } = queryConfig;

  // get category types
  const useCategoryTypes = () =>
    useQuery({
      queryKey: CATEGORY_TYPES_KEY,
      queryFn: () =>
        Api.getCategoryTypes(queryConfig).then((data) => convertJs(data)),
      ...defaultQueryOptions,
      cacheTime: CONSTANT_KEY_CACHE_TIME_MILLISECONDS,
    });

  // get categories
  const useCategories = (typeIds?: UUID[]) =>
    useQuery({
      queryKey: buildCategoriesKey(typeIds),
      queryFn: () =>
        Api.getCategories(queryConfig, typeIds).then((data) => convertJs(data)),
      ...defaultQueryOptions,
      cacheTime: CONSTANT_KEY_CACHE_TIME_MILLISECONDS,
    });

  const useCategory = (categoryId: UUID) =>
    useQuery({
      queryKey: buildCategoryKey(categoryId),
      queryFn: () =>
        Api.getCategory(categoryId, queryConfig).then((data) => data),
      ...defaultQueryOptions,
      cacheTime: CONSTANT_KEY_CACHE_TIME_MILLISECONDS,
    });

  const useItemCategories = (itemId: UUID) =>
    useQuery({
      queryKey: buildItemCategoriesKey(itemId),
      queryFn: () =>
        Api.getItemCategories(itemId, queryConfig).then((data) =>
          convertJs(data),
        ),
      ...defaultQueryOptions,
      enabled: Boolean(itemId),
    });

  const useItemsInCategories = (categoryIds: UUID[]) =>
    useQuery({
      queryKey: buildItemsByCategoriesKey(categoryIds),
      queryFn: () =>
        Api.buildGetItemsForCategoriesRoute(categoryIds, queryConfig).then(
          (data) => convertJs(data),
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

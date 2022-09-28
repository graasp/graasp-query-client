import { useQuery } from 'react-query';

import { List } from 'immutable';
import { convertJs } from '@graasp/sdk';

import * as Api from '../api';
import { CONSTANT_KEY_CACHE_TIME_MILLISECONDS } from '../config/constants';
import {
  CATEGORY_TYPES_KEY,
  buildCategoriesKey,
  buildCategoryKey,
  buildItemCategoriesKey,
  buildItemsByCategoriesKey,
} from '../config/keys';
import { CategoryRecord, CategoryTypeRecord, ItemCategoryRecord, QueryClientConfig, UUID } from '../types';
import { UndefinedArgument } from '../config/errors';

export default (queryConfig: QueryClientConfig) => {
  const { defaultQueryOptions } = queryConfig;

  // get category types
  const useCategoryTypes = () =>
    useQuery<List<CategoryTypeRecord>, Error>({
      queryKey: CATEGORY_TYPES_KEY,
      queryFn: () =>
        Api.getCategoryTypes(queryConfig).then((data) => convertJs(data)),
      ...defaultQueryOptions,
      cacheTime: CONSTANT_KEY_CACHE_TIME_MILLISECONDS,
    });

  // get categories
  const useCategories = (typeIds?: UUID[]) =>
    useQuery<List<CategoryRecord>, Error>({
      queryKey: buildCategoriesKey(typeIds),
      queryFn: () =>
        Api.getCategories(queryConfig, typeIds).then((data) => convertJs(data)),
      ...defaultQueryOptions,
      cacheTime: CONSTANT_KEY_CACHE_TIME_MILLISECONDS,
    });

  const useCategory = (categoryId: UUID) =>
    useQuery<CategoryRecord, Error>({
      queryKey: buildCategoryKey(categoryId),
      queryFn: () =>
        Api.getCategory(categoryId, queryConfig).then((data) =>
          convertJs(data),
        ),
      ...defaultQueryOptions,
      cacheTime: CONSTANT_KEY_CACHE_TIME_MILLISECONDS,
    });

  const useItemCategories = (itemId?: UUID) =>
    useQuery<List<ItemCategoryRecord>, Error>({
      queryKey: buildItemCategoriesKey(itemId),
      queryFn: () => {
        if (!itemId) {
          throw new UndefinedArgument();
        }
        return Api.getItemCategories(itemId, queryConfig).then((data) =>
          convertJs(data),
        )
      },
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

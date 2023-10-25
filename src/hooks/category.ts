import { Category, ItemCategory, UUID } from '@graasp/sdk';

import { useQuery } from 'react-query';

import * as Api from '../api';
import { CONSTANT_KEY_CACHE_TIME_MILLISECONDS } from '../config/constants';
import { UndefinedArgument } from '../config/errors';
import {
  buildCategoriesKey,
  buildCategoryKey,
  buildItemCategoriesKey,
  buildItemsByCategoriesKey,
} from '../config/keys';
import { QueryClientConfig } from '../types';

export default (queryConfig: QueryClientConfig) => {
  const { defaultQueryOptions } = queryConfig;

  // get categories
  const useCategories = (typeIds?: UUID[]) =>
    useQuery<Category[], Error>({
      queryKey: buildCategoriesKey(typeIds),
      queryFn: () =>
        Api.getCategories(queryConfig, typeIds).then((data) => data),
      ...defaultQueryOptions,
      cacheTime: CONSTANT_KEY_CACHE_TIME_MILLISECONDS,
    });

  const useCategory = (categoryId: UUID) =>
    useQuery<Category, Error>({
      queryKey: buildCategoryKey(categoryId),
      queryFn: () =>
        Api.getCategory(categoryId, queryConfig).then((data) => data),
      ...defaultQueryOptions,
      cacheTime: CONSTANT_KEY_CACHE_TIME_MILLISECONDS,
    });

  const useItemCategories = (itemId?: UUID) =>
    useQuery<ItemCategory[], Error>({
      queryKey: buildItemCategoriesKey(itemId),
      queryFn: () => {
        if (!itemId) {
          throw new UndefinedArgument();
        }
        return Api.getItemCategories(itemId, queryConfig).then((data) => data);
      },
      ...defaultQueryOptions,
      enabled: Boolean(itemId),
    });

  const useItemsInCategories = (categoryIds: UUID[]) =>
    useQuery({
      queryKey: buildItemsByCategoriesKey(categoryIds),
      queryFn: () =>
        Api.buildGetItemsForCategoriesRoute(categoryIds, queryConfig).then(
          (data) => data,
        ),
      ...defaultQueryOptions,
      enabled: Boolean(categoryIds),
    });

  return {
    useCategories,
    useCategory,
    useItemCategories,
    useItemsInCategories,
  };
};

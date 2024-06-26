import { UUID } from '@graasp/sdk';

import { useQuery } from '@tanstack/react-query';

import * as Api from '../api/category.js';
import { CONSTANT_KEY_STALE_TIME_MILLISECONDS } from '../config/constants.js';
import { UndefinedArgument } from '../config/errors.js';
import { categoryKeys, itemKeys } from '../keys.js';
import { QueryClientConfig } from '../types.js';

export default (queryConfig: QueryClientConfig) => {
  const { defaultQueryOptions } = queryConfig;

  // get categories
  const useCategories = (typeIds?: UUID[]) =>
    useQuery({
      queryKey: categoryKeys.many(typeIds),
      queryFn: () => Api.getCategories(queryConfig, typeIds),
      ...defaultQueryOptions,
      staleTime: CONSTANT_KEY_STALE_TIME_MILLISECONDS,
    });

  const useCategory = (categoryId: UUID) =>
    useQuery({
      queryKey: categoryKeys.single(categoryId),
      queryFn: () => Api.getCategory(categoryId, queryConfig),
      ...defaultQueryOptions,
      staleTime: CONSTANT_KEY_STALE_TIME_MILLISECONDS,
    });

  const useItemCategories = (itemId?: UUID) =>
    useQuery({
      queryKey: itemKeys.single(itemId).categories,
      queryFn: () => {
        if (!itemId) {
          throw new UndefinedArgument();
        }
        return Api.getItemCategories(itemId, queryConfig);
      },
      ...defaultQueryOptions,
      enabled: Boolean(itemId),
    });

  const useItemsInCategories = (categoryIds: UUID[]) =>
    useQuery({
      queryKey: itemKeys.categories(categoryIds),
      queryFn: () =>
        Api.buildGetItemsForCategoriesRoute(categoryIds, queryConfig),
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

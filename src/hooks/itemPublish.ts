import { ItemPublished, MAX_TARGETS_FOR_READ_REQUEST, UUID } from '@graasp/sdk';

import { queryOptions, useQuery } from '@tanstack/react-query';

import { splitRequestByIdsAndReturn } from '../api/axios.js';
import * as Api from '../api/itemPublish.js';
import { UndefinedArgument } from '../config/errors.js';
import { itemKeys } from '../keys.js';
import { QueryClientConfig } from '../types.js';

export default (queryConfig: QueryClientConfig) => {
  const { defaultQueryOptions } = queryConfig;

  const publishedItemsForMemberOptions = (
    memberId?: UUID,
    options?: { enabled?: boolean },
  ) =>
    queryOptions({
      queryKey: itemKeys.published().byMember(memberId),
      queryFn: () => {
        if (!memberId) {
          throw new UndefinedArgument();
        }
        return Api.getPublishedItemsForMember(memberId!, queryConfig);
      },
      ...defaultQueryOptions,
      enabled: Boolean(memberId) && (options?.enabled ?? true),
    });

  const mostLikedPublishedItemsOptions = (
    args?: {
      limit?: number;
    },
    options?: { enabled?: boolean },
  ) => {
    const enabledValue = options?.enabled ?? true;
    return queryOptions({
      queryKey: itemKeys.published().mostLiked(args?.limit),
      queryFn: () => Api.getMostLikedPublishedItems(args ?? {}, queryConfig),
      ...defaultQueryOptions,
      enabled: enabledValue,
    });
  };

  const mostRecentPublishedItemsOptions = (
    args?: {
      limit?: number;
    },
    options?: { enabled?: boolean },
  ) => {
    const enabledValue = options?.enabled ?? true;
    return queryOptions({
      queryKey: itemKeys.published().mostRecent(args?.limit),
      queryFn: () => Api.getMostRecentPublishedItems(args ?? {}, queryConfig),
      ...defaultQueryOptions,
      enabled: enabledValue,
    });
  };

  return {
    useAllPublishedItems: (
      args?: {
        categoryIds?: UUID[];
      },
      options?: { enabled?: boolean },
    ) => {
      const enabledValue = options?.enabled ?? true;
      return useQuery({
        queryKey: itemKeys.published().forCategories(args?.categoryIds),
        queryFn: () => Api.getAllPublishedItems(args ?? {}, queryConfig),
        ...defaultQueryOptions,
        enabled: enabledValue,
      });
    },
    mostLikedPublishedItemsOptions,
    useMostLikedPublishedItems: (
      args?: {
        limit?: number;
      },
      options?: { enabled?: boolean },
    ) => useQuery(mostLikedPublishedItemsOptions(args, options)),
    mostRecentPublishedItemsOptions,
    useMostRecentPublishedItems: (
      args?: {
        limit?: number;
      },
      options?: { enabled?: boolean },
    ) => useQuery(mostRecentPublishedItemsOptions(args, options)),
    publishedItemsForMemberOptions,
    usePublishedItemsForMember: (
      memberId?: UUID,
      options?: { enabled?: boolean },
    ) => useQuery(publishedItemsForMemberOptions(memberId, options)),
    useItemPublishedInformation: (
      args: {
        itemId?: UUID;
      },
      options?: { enabled?: boolean },
    ) => {
      const enabledValue = (options?.enabled ?? true) && Boolean(args.itemId);
      return useQuery({
        queryKey: itemKeys.single(args.itemId).publishedInformation,
        queryFn: () => {
          const { itemId } = args;
          if (!itemId) {
            throw new UndefinedArgument(args);
          }
          return Api.getItemPublishedInformation(itemId, queryConfig);
        },
        ...defaultQueryOptions,
        enabled: enabledValue,
      });
    },
    useManyItemPublishedInformations: (
      args: {
        itemIds: UUID[];
      },
      options?: { enabled?: boolean },
    ) => {
      const enabled =
        (options?.enabled ?? true) && Boolean(args.itemIds.length);

      return useQuery({
        queryKey: itemKeys.many(args.itemIds).publishedInformation,
        queryFn: () =>
          splitRequestByIdsAndReturn<ItemPublished>(
            args.itemIds,
            MAX_TARGETS_FOR_READ_REQUEST,
            (chunk) => Api.getManyItemPublishedInformations(chunk, queryConfig),
            true,
          ),
        ...defaultQueryOptions,
        enabled,
      });
    },
  };
};

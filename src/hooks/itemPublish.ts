import { ItemPublished, MAX_TARGETS_FOR_READ_REQUEST, UUID } from '@graasp/sdk';

import { useQuery } from '@tanstack/react-query';

import { splitRequestByIdsAndReturn } from '../api/axios.js';
import * as Api from '../api/itemPublish.js';
import { UndefinedArgument } from '../config/errors.js';
import { itemKeys } from '../keys.js';
import configureQueryOptions from '../queryOptions/index.js';
import { QueryClientConfig } from '../types.js';

export default (queryConfig: QueryClientConfig) => {
  const { defaultQueryOptions } = queryConfig;
  const {
    mostLikedPublishedItemsOptions,
    mostRecentPublishedItemsOptions,
    publishedItemsForMemberOptions,
  } = configureQueryOptions(queryConfig);

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
    useMostLikedPublishedItems: (
      args?: {
        limit?: number;
      },
      options?: { enabled?: boolean },
    ) => useQuery(mostLikedPublishedItemsOptions(args, options)),
    useMostRecentPublishedItems: (
      args?: {
        limit?: number;
      },
      options?: { enabled?: boolean },
    ) => useQuery(mostRecentPublishedItemsOptions(args, options)),
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

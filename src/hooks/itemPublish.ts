import { UUID } from '@graasp/sdk';

import { useQuery } from '@tanstack/react-query';

import * as Api from '../api/itemPublish.js';
import { UndefinedArgument } from '../config/errors.js';
import { itemKeys } from '../keys.js';
import { QueryClientConfig } from '../types.js';

export default (queryConfig: QueryClientConfig) => {
  const { defaultQueryOptions } = queryConfig;

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
    ) => {
      const enabledValue = options?.enabled ?? true;
      return useQuery({
        queryKey: itemKeys.published().mostLiked(args?.limit),
        queryFn: () => Api.getMostLikedPublishedItems(args ?? {}, queryConfig),
        ...defaultQueryOptions,
        enabled: enabledValue,
      });
    },
    useMostRecentPublishedItems: (
      args?: {
        limit?: number;
      },
      options?: { enabled?: boolean },
    ) => {
      const enabledValue = options?.enabled ?? true;
      return useQuery({
        queryKey: itemKeys.published().mostRecent(args?.limit),
        queryFn: () => Api.getMostRecentPublishedItems(args ?? {}, queryConfig),
        ...defaultQueryOptions,
        enabled: enabledValue,
      });
    },
    usePublishedItemsForMember: (
      memberId?: UUID,
      options?: { enabled?: boolean },
    ) =>
      useQuery({
        queryKey: itemKeys.published().byMember(memberId),
        queryFn: () => {
          if (!memberId) {
            throw new UndefinedArgument();
          }
          return Api.getPublishedItemsForMember(memberId, queryConfig);
        },
        ...defaultQueryOptions,
        enabled: Boolean(memberId) && (options?.enabled ?? true),
      }),
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
  };
};

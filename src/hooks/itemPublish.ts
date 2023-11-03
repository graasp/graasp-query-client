import { ItemPublished, MAX_TARGETS_FOR_READ_REQUEST, UUID } from '@graasp/sdk';

import { useQuery, useQueryClient } from 'react-query';

import * as Api from '../api';
import { splitRequestByIdsAndReturn } from '../api/axios';
import { UndefinedArgument } from '../config/errors';
import {
  buildGetMostLikedPublishedItems,
  buildGetMostRecentPublishedItems,
  buildItemPublishedInformationKey,
  buildManyItemPublishedInformationsKey,
  buildPublishedItemsForMemberKey,
  buildPublishedItemsKey,
} from '../config/keys';
import { QueryClientConfig } from '../types';

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
        queryKey: buildPublishedItemsKey(args?.categoryIds),
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
        queryKey: buildGetMostLikedPublishedItems(args?.limit),
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
        queryKey: buildGetMostRecentPublishedItems(args?.limit),
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
        queryKey: buildPublishedItemsForMemberKey(memberId),
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
        itemId: UUID;
      },
      options?: { enabled?: boolean },
    ) => {
      const enabledValue = (options?.enabled ?? true) && Boolean(args.itemId);
      return useQuery({
        queryKey: buildItemPublishedInformationKey(args.itemId),
        queryFn: () =>
          Api.getItemPublishedInformation(args.itemId, queryConfig),
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
      const queryClient = useQueryClient();
      return useQuery({
        queryKey: buildManyItemPublishedInformationsKey(args.itemIds),
        queryFn: () =>
          splitRequestByIdsAndReturn<ItemPublished>(
            args.itemIds,
            MAX_TARGETS_FOR_READ_REQUEST,
            (chunk) => Api.getManyItemPublishedInformations(chunk, queryConfig),
            true,
          ),
        onSuccess: async (publishedData) => {
          // save items in their own key
          if (publishedData?.data) {
            Object.values(publishedData?.data)?.forEach(async (p) => {
              const { id } = p.item;
              queryClient.setQueryData(buildItemPublishedInformationKey(id), p);
            });
          }
        },
        ...defaultQueryOptions,
        enabled,
      });
    },
  };
};

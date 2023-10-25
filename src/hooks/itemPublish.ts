import {
  Item,
  ItemPublished,
  MAX_TARGETS_FOR_READ_REQUEST,
  ResultOf,
  UUID,
} from '@graasp/sdk';

import { useQuery, useQueryClient } from 'react-query';

import * as Api from '../api';
import { splitRequestByIds } from '../api/axios';
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
        queryFn: (): Promise<Item[]> =>
          Api.getAllPublishedItems(args ?? {}, queryConfig).then(
            (data) => data,
          ),
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
        queryFn: (): Promise<Item[]> =>
          Api.getMostLikedPublishedItems(args ?? {}, queryConfig).then(
            (data) => data,
          ),
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
        queryFn: (): Promise<Item[]> =>
          Api.getMostRecentPublishedItems(args ?? {}, queryConfig).then(
            (data) => data,
          ),
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
        queryFn: (): Promise<Item[]> => {
          if (!memberId) {
            throw new UndefinedArgument();
          }
          return Api.getPublishedItemsForMember(memberId, queryConfig).then(
            (data) => data,
          );
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
        queryFn: (): Promise<ItemPublished> =>
          Api.getItemPublishedInformation(args.itemId, queryConfig).then(
            (data) => data,
          ),
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
        queryFn: (): Promise<ResultOf<ItemPublished>> =>
          splitRequestByIds<ItemPublished>(
            args.itemIds,
            MAX_TARGETS_FOR_READ_REQUEST,
            (chunk) => Api.getManyItemPublishedInformations(chunk, queryConfig),
            true,
          ),
        onSuccess: async (publishedData) => {
          // save items in their own key
          Object.values(publishedData?.data)?.forEach(async (p) => {
            const { id } = p.item;
            queryClient.setQueryData(buildItemPublishedInformationKey(id), p);
          });
        },
        ...defaultQueryOptions,
        enabled,
      });
    },
  };
};

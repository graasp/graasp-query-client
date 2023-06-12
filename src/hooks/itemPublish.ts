import { List } from 'immutable';
import { useQuery, useQueryClient } from 'react-query';

import {
  ItemPublished,
  MAX_TARGETS_FOR_READ_REQUEST,
  UUID,
  convertJs,
} from '@graasp/sdk';
import {
  ItemPublishedRecord,
  ItemRecord,
  ResultOfRecord,
} from '@graasp/sdk/frontend';

import * as Api from '../api';
import { splitRequestByIds } from '../api/axios';
import { UndefinedArgument } from '../config/errors';
import {
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
        queryFn: (): Promise<List<ItemRecord>> =>
          Api.getAllPublishedItems(args ?? {}, queryConfig).then((data) =>
            convertJs(data),
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
        queryFn: (): Promise<List<ItemRecord>> => {
          if (!memberId) {
            throw new UndefinedArgument();
          }
          return Api.getPublishedItemsForMember(memberId, queryConfig).then(
            (data) => convertJs(data),
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
        queryFn: (): Promise<ItemPublishedRecord> =>
          Api.getItemPublishedInformation(args.itemId, queryConfig).then(
            (data) => convertJs(data),
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
        queryFn: (): Promise<ResultOfRecord<ItemPublished>> =>
          splitRequestByIds<ItemPublished>(
            args.itemIds,
            MAX_TARGETS_FOR_READ_REQUEST,
            (chunk) => Api.getManyItemPublishedInformations(chunk, queryConfig),
            true,
          ),
        onSuccess: async (publishedData) => {
          // save items in their own key
          publishedData?.data?.toSeq()?.forEach(async (p) => {
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

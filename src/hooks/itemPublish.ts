import { List } from 'immutable';
import { useQuery } from 'react-query';

import { UUID, convertJs } from '@graasp/sdk';
import { ItemPublishedRecord, ItemRecord } from '@graasp/sdk/frontend';

import * as Api from '../api';
import { UndefinedArgument } from '../config/errors';
import {
  buildItemPublishedInformationKey,
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
  };
};

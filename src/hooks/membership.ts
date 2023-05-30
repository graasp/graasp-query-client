import { List } from 'immutable';
import { QueryClient, UseQueryResult, useQuery } from 'react-query';

import {
  ItemMembership,
  MAX_TARGETS_FOR_READ_REQUEST,
  UUID,
  convertJs,
} from '@graasp/sdk';
import { ItemMembershipRecord, ResultOfRecord } from '@graasp/sdk/frontend';

import * as Api from '../api';
import { splitRequestByIds } from '../api/axios';
import { UndefinedArgument } from '../config/errors';
import {
  buildItemMembershipsKey,
  buildManyItemMembershipsKey,
} from '../config/keys';
import { QueryClientConfig } from '../types';
import { configureWsMembershipHooks } from '../ws';
import { WebsocketClient } from '../ws/ws-client';

export default (
  queryClient: QueryClient,
  queryConfig: QueryClientConfig,
  websocketClient?: WebsocketClient,
): {
  useItemMemberships: (
    id?: UUID,
    options?: { getUpdates?: boolean },
  ) => UseQueryResult<List<ItemMembershipRecord>>;
  useManyItemMemberships: (
    ids?: UUID[],
    options?: { getUpdates?: boolean },
  ) => UseQueryResult<ResultOfRecord<ItemMembership[]>>;
} => {
  const { enableWebsocket, defaultQueryOptions } = queryConfig;

  const membershipWsHooks =
    enableWebsocket && websocketClient // required to type-check non-null
      ? configureWsMembershipHooks(queryClient, websocketClient)
      : undefined;

  return {
    useItemMemberships: (
      id?: UUID,
      options?: { getUpdates?: boolean },
    ): UseQueryResult<List<ItemMembershipRecord>> => {
      const getUpdates = options?.getUpdates ?? enableWebsocket;

      membershipWsHooks?.useItemsMembershipsUpdates(
        getUpdates && id ? [id] : null,
      );

      return useQuery({
        queryKey: buildItemMembershipsKey(id),
        queryFn: (): Promise<List<ItemMembershipRecord>> => {
          if (!id) {
            throw new UndefinedArgument();
          }

          return Api.getMembershipsForItems([id], queryConfig).then((data) =>
            convertJs(data.data[id]),
          );
        },
        enabled: Boolean(id),
        ...defaultQueryOptions,
      });
    },

    useManyItemMemberships: (
      ids?: UUID[],
      options?: { getUpdates?: boolean },
    ): UseQueryResult<ResultOfRecord<ItemMembership[]>> => {
      const getUpdates = options?.getUpdates ?? enableWebsocket;

      membershipWsHooks?.useItemsMembershipsUpdates(getUpdates ? ids : null);

      return useQuery({
        queryKey: buildManyItemMembershipsKey(ids),
        queryFn: (): Promise<ResultOfRecord<ItemMembership[]>> => {
          if (!ids) {
            throw new UndefinedArgument();
          }

          return splitRequestByIds(ids, MAX_TARGETS_FOR_READ_REQUEST, (chunk) =>
            Api.getMembershipsForItems(chunk, queryConfig),
          );
        },
        onSuccess: async (memberships) => {
          // save memberships in their own key
          ids?.forEach(async (id) => {
            queryClient.setQueryData(
              buildItemMembershipsKey(id),
              memberships.data[id],
            );
          });
        },
        enabled: Boolean(ids?.length) && ids?.every((id) => Boolean(id)),
        ...defaultQueryOptions,
      });
    },
  };
};

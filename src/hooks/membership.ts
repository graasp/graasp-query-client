import {
  ItemMembership,
  MAX_TARGETS_FOR_READ_REQUEST,
  ResultOf,
  UUID,
} from '@graasp/sdk';
import { WebsocketClient } from '@graasp/sdk/frontend';

import { UseQueryResult, useQuery, useQueryClient } from 'react-query';

import * as Api from '../api';
import { splitRequestByIds } from '../api/axios';
import { UndefinedArgument } from '../config/errors';
import {
  buildItemMembershipsKey,
  buildManyItemMembershipsKey,
} from '../config/keys';
import { QueryClientConfig } from '../types';
import { configureWsMembershipHooks } from '../ws';

export default (
  queryConfig: QueryClientConfig,
  websocketClient?: WebsocketClient,
): {
  useItemMemberships: (
    id?: UUID,
    options?: { getUpdates?: boolean },
  ) => UseQueryResult<ItemMembership[]>;
  useManyItemMemberships: (
    ids?: UUID[],
    options?: { getUpdates?: boolean },
  ) => UseQueryResult<ResultOf<ItemMembership[]>>;
} => {
  const { enableWebsocket, defaultQueryOptions } = queryConfig;

  const membershipWsHooks =
    enableWebsocket && websocketClient // required to type-check non-null
      ? configureWsMembershipHooks(websocketClient)
      : undefined;

  return {
    useItemMemberships: (
      id?: UUID,
      options?: { getUpdates?: boolean },
    ): UseQueryResult<ItemMembership[]> => {
      const getUpdates = options?.getUpdates ?? enableWebsocket;

      membershipWsHooks?.useItemsMembershipsUpdates(
        getUpdates && id ? [id] : null,
      );

      return useQuery({
        queryKey: buildItemMembershipsKey(id),
        queryFn: (): Promise<ItemMembership[]> => {
          if (!id) {
            throw new UndefinedArgument();
          }

          return Api.getMembershipsForItems([id], queryConfig).then(
            (data) => data.data[id],
          );
        },
        enabled: Boolean(id),
        ...defaultQueryOptions,
      });
    },

    useManyItemMemberships: (
      ids?: UUID[],
      options?: { getUpdates?: boolean },
    ): UseQueryResult<ResultOf<ItemMembership[]>> => {
      const queryClient = useQueryClient();
      const getUpdates = options?.getUpdates ?? enableWebsocket;

      membershipWsHooks?.useItemsMembershipsUpdates(getUpdates ? ids : null);

      return useQuery({
        queryKey: buildManyItemMembershipsKey(ids),
        queryFn: (): Promise<ResultOf<ItemMembership[]>> => {
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

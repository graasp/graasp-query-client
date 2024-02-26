import {
  MAX_TARGETS_FOR_READ_REQUEST,
  UUID,
  WebsocketClient,
} from '@graasp/sdk';

import { useQuery, useQueryClient } from 'react-query';

import { splitRequestByIdsAndReturn } from '../api/axios.js';
import * as Api from '../api/membership.js';
import { UndefinedArgument } from '../config/errors.js';
import {
  buildItemMembershipsKey,
  buildManyItemMembershipsKey,
} from '../config/keys.js';
import { QueryClientConfig } from '../types.js';
import { configureWsMembershipHooks } from '../ws/index.js';

export default (
  queryConfig: QueryClientConfig,
  websocketClient?: WebsocketClient,
) => {
  const { enableWebsocket, defaultQueryOptions } = queryConfig;

  const membershipWsHooks =
    enableWebsocket && websocketClient // required to type-check non-null
      ? configureWsMembershipHooks(websocketClient)
      : undefined;

  return {
    useItemMemberships: (id?: UUID, options?: { getUpdates?: boolean }) => {
      const getUpdates = options?.getUpdates ?? enableWebsocket;

      membershipWsHooks?.useItemsMembershipsUpdates(
        getUpdates && id ? [id] : null,
      );

      return useQuery({
        queryKey: buildItemMembershipsKey(id),
        queryFn: () => {
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
    ) => {
      const queryClient = useQueryClient();
      const getUpdates = options?.getUpdates ?? enableWebsocket;

      membershipWsHooks?.useItemsMembershipsUpdates(getUpdates ? ids : null);

      return useQuery({
        queryKey: buildManyItemMembershipsKey(ids),
        queryFn: () => {
          if (!ids) {
            throw new UndefinedArgument();
          }

          return splitRequestByIdsAndReturn(
            ids,
            MAX_TARGETS_FOR_READ_REQUEST,
            (chunk) => Api.getMembershipsForItems(chunk, queryConfig),
          );
        },
        onSuccess: async (memberships) => {
          // save memberships in their own key
          if (memberships) {
            ids?.forEach(async (id) => {
              queryClient.setQueryData(
                buildItemMembershipsKey(id),
                memberships.data[id],
              );
            });
          }
        },
        enabled: Boolean(ids?.length) && ids?.every((id) => Boolean(id)),
        ...defaultQueryOptions,
      });
    },
  };
};

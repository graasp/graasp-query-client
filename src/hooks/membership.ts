import {
  MAX_TARGETS_FOR_READ_REQUEST,
  UUID,
  WebsocketClient,
} from '@graasp/sdk';

import { useQuery } from '@tanstack/react-query';

import { splitRequestByIdsAndReturn } from '../api/axios.js';
import * as Api from '../api/membership.js';
import { UndefinedArgument } from '../config/errors.js';
import { buildManyItemMembershipsKey, itemKeys } from '../keys.js';
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
        queryKey: itemKeys.single(id).memberships,
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
        enabled: Boolean(ids?.length) && ids?.every((id) => Boolean(id)),
        ...defaultQueryOptions,
      });
    },
  };
};

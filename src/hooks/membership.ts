import { UUID, WebsocketClient } from '@graasp/sdk';

import { useQuery } from '@tanstack/react-query';

import * as Api from '../api/membership.js';
import { UndefinedArgument } from '../config/errors.js';
import { itemKeys } from '../keys.js';
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

          return Api.getMembershipsForItem(id, queryConfig);
        },
        enabled: Boolean(id),
        ...defaultQueryOptions,
      });
    },
  };
};

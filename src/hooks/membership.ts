import { List } from 'immutable';
import { QueryClient, useQuery } from 'react-query';
import * as Api from '../api';
import {
  buildItemMembershipsKey,
  buildManyItemMembershipsKey,
} from '../config/keys';
import {
  MembershipRecord,
  QueryClientConfig,
  UndefinedArgument,
  UUID,
} from '../types';
import { convertJs } from '../utils/util';
import { configureWsMembershipHooks } from '../ws';
import { WebsocketClient } from '../ws/ws-client';

export default (
  queryClient: QueryClient,
  queryConfig: QueryClientConfig,
  websocketClient?: WebsocketClient,
) => {
  const { enableWebsocket, defaultQueryOptions } = queryConfig;

  const membershipWsHooks =
    enableWebsocket && websocketClient // required to type-check non-null
      ? configureWsMembershipHooks(queryClient, websocketClient)
      : undefined;

  return {
    useItemMemberships: (id?: UUID, options?: { getUpdates?: boolean }) => {
      const getUpdates = options?.getUpdates ?? enableWebsocket;

      membershipWsHooks?.useItemsMembershipsUpdates(
        getUpdates && id ? [id] : null,
      );

      return useQuery({
        queryKey: buildItemMembershipsKey(id),
        queryFn: (): Promise<List<MembershipRecord>> => {
          if (!id) {
            throw new UndefinedArgument();
          }

          return Api.getMembershipsForItems([id], queryConfig).then((data) =>
            convertJs(data[0]),
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
        queryFn: (): Promise<List<List<MembershipRecord>>> => {
          if (!ids) {
            throw new UndefinedArgument();
          }

          return Api.getMembershipsForItems(ids, queryConfig).then((data) =>
            convertJs(data),
          );
        },
        onSuccess: async (memberships: List<List<MembershipRecord>>) => {
          // save memberships in their own key
          ids?.forEach(async (id, idx) => {
            queryClient.setQueryData(
              buildItemMembershipsKey(id),
              memberships.get(idx) as List<MembershipRecord>,
            );
          });
        },
        enabled: Boolean(ids?.length) && ids?.every((id) => Boolean(id)),
        ...defaultQueryOptions,
      });
    },
  };
};

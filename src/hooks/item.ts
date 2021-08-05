import { List, Map } from 'immutable';
import { QueryClient, useQuery } from 'react-query';
import * as Api from '../api';
import {
  buildFileContentKey,
  buildItemChildrenKey,
  buildItemKey,
  buildItemLoginKey,
  buildItemMembershipsKey,
  buildItemParentsKey,
  buildItemsKey,
  buildS3FileContentKey,
  OWN_ITEMS_KEY,
  SHARED_ITEMS_KEY,
} from '../config/keys';
import { Item, QueryClientConfig, UndefinedArgument, UUID } from '../types';
import { configureWsItemHooks, configureWsMembershipHooks } from '../ws';
import { WebsocketClient } from '../ws/ws-client';

export default (
  queryClient: QueryClient,
  queryConfig: QueryClientConfig,
  useCurrentMember: Function,
  websocketClient?: WebsocketClient,
) => {
  const { retry, cacheTime, staleTime, enableWebsocket } = queryConfig;
  const defaultOptions = {
    retry,
    cacheTime,
    staleTime,
  };

  const itemWsHooks =
    enableWebsocket && websocketClient // required to type-check non-null
      ? configureWsItemHooks(queryClient, websocketClient)
      : undefined;
  const membershipWsHooks =
    enableWebsocket && websocketClient // required to type-check non-null
      ? configureWsMembershipHooks(queryClient, websocketClient)
      : undefined;

  return {
    useOwnItems: (options?: { getUpdates?: boolean }) => {
      const getUpdates = options?.getUpdates ?? enableWebsocket;

      const { data: currentMember } = useCurrentMember();
      itemWsHooks?.useOwnItemsUpdates(
        getUpdates ? currentMember?.get('id') : null,
      );

      return useQuery({
        queryKey: OWN_ITEMS_KEY,
        queryFn: () => Api.getOwnItems(queryConfig).then((data) => List(data)),
        onSuccess: async (items: List<Item>) => {
          // save items in their own key
          // eslint-disable-next-line no-unused-expressions
          items?.forEach(async (item) => {
            const { id } = item;
            queryClient.setQueryData(buildItemKey(id), Map(item));
          });
        },
        ...defaultOptions,
      });
    },

    useChildren: (
      id: UUID | undefined,
      options?: { enabled?: boolean; ordered?: boolean; getUpdates?: boolean },
    ) => {
      const enabled = options?.enabled ?? true;
      const ordered = options?.ordered ?? true;
      const getUpdates = options?.getUpdates ?? enableWebsocket;

      itemWsHooks?.useChildrenUpdates(getUpdates ? id : null);

      return useQuery({
        queryKey: buildItemChildrenKey(id),
        queryFn: () => {
          if (!id) {
            throw new UndefinedArgument();
          }
          return Api.getChildren(id, ordered, queryConfig).then((data) =>
            List(data),
          );
        },
        onSuccess: async (items: List<Item>) => {
          if (items?.size) {
            // save items in their own key
            items.forEach(async (item) => {
              const { id: itemId } = item;
              queryClient.setQueryData(buildItemKey(itemId), Map(item));
            });
          }
        },
        ...defaultOptions,
        enabled: Boolean(id) && enabled,
      });
    },

    useParents: ({
      id,
      path,
      enabled,
    }: {
      id: UUID;
      path: string;
      enabled?: boolean;
    }) =>
      useQuery({
        queryKey: buildItemParentsKey(id),
        queryFn: () =>
          Api.getParents({ path }, queryConfig).then((data) => List(data)),
        onSuccess: async (items: List<Item>) => {
          if (items?.size) {
            // save items in their own key
            items.forEach(async (item) => {
              const { id: itemId } = item;
              queryClient.setQueryData(buildItemKey(itemId), Map(item));
            });
          }
        },
        ...defaultOptions,
        enabled: enabled && Boolean(id),
      }),

    useSharedItems: (options?: { getUpdates?: boolean }) => {
      const getUpdates = options?.getUpdates ?? enableWebsocket;

      const { data: currentMember } = useCurrentMember();
      itemWsHooks?.useSharedItemsUpdates(
        getUpdates ? currentMember?.get('id') : null,
      );

      return useQuery({
        queryKey: SHARED_ITEMS_KEY,
        queryFn: () =>
          Api.getSharedItems(queryConfig).then((data) => List(data)),
        onSuccess: async (items: List<Item>) => {
          // save items in their own key
          items.forEach(async (item) => {
            const { id } = item;
            queryClient.setQueryData(buildItemKey(id), Map(item));
          });
        },
        ...defaultOptions,
      });
    },

    useItem: (id?: UUID, options?: { getUpdates?: boolean }) => {
      const getUpdates = options?.getUpdates ?? enableWebsocket;

      itemWsHooks?.useItemUpdates(getUpdates ? id : null);

      return useQuery({
        queryKey: buildItemKey(id),
        queryFn: () => {
          if (!id) {
            throw new UndefinedArgument();
          }
          return Api.getItem(id, queryConfig).then((data) => Map(data));
        },
        enabled: Boolean(id),
        ...defaultOptions,
      });
    },

    // todo: add optimisation to avoid fetching items already in cache
    useItems: (ids: UUID[], options?: { getUpdates?: boolean }) => {
      const getUpdates = options?.getUpdates ?? enableWebsocket;

      ids.map((id) => itemWsHooks?.useItemUpdates(getUpdates ? id : null));

      return useQuery({
        queryKey: buildItemsKey(ids),
        queryFn: () =>
          ids
            ? ids.length == 1
              ? Api.getItem(ids[0], queryConfig).then((data) => List([data]))
              : Api.getItems(ids, queryConfig).then((data) => List(data))
            : undefined,
        onSuccess: async (items: List<Item>) => {
          // save items in their own key
          items?.forEach(async (item) => {
            const { id } = item;
            queryClient.setQueryData(buildItemKey(id), Map(item));
          });
        },
        enabled: ids && Boolean(ids.length) && ids.every((id) => Boolean(id)),
        ...defaultOptions,
      });
    },

    useItemMemberships: (id?: UUID, options?: { getUpdates?: boolean }) => {
      const getUpdates = options?.getUpdates ?? enableWebsocket;

      membershipWsHooks?.useItemMembershipsUpdates(getUpdates ? id : null);

      return useQuery({
        queryKey: buildItemMembershipsKey(id),
        queryFn: () => {
          if (!id) {
            throw new UndefinedArgument();
          }

          return Api.getMembershipsForItem(id, queryConfig).then((data) =>
            List(data),
          );
        },
        enabled: Boolean(id),
        ...defaultOptions,
      });
    },

    useItemLogin: (id?: UUID) =>
      useQuery({
        queryKey: buildItemLoginKey(id),
        queryFn: () => {
          if (!id) {
            throw new UndefinedArgument();
          }
          return Api.getItemLogin(id, queryConfig).then((data) => Map(data));
        },
        enabled: Boolean(id),
        ...defaultOptions,
      }),

    useFileContent: (
      id?: UUID,
      { enabled = true }: { enabled?: boolean } = {},
    ) =>
      useQuery({
        queryKey: buildFileContentKey(id),
        queryFn: () => {
          if (!id) {
            throw new UndefinedArgument();
          }
          return Api.getFileContent({ id }, queryConfig).then((data) =>
            data.blob(),
          );
        },
        enabled: Boolean(id) && enabled,
        ...defaultOptions,
      }),

    useS3FileContent: (
      id?: UUID,
      { enabled = true }: { enabled?: boolean } = {},
    ) =>
      useQuery({
        queryKey: buildS3FileContentKey(id),
        queryFn: () => {
          if (!id) {
            throw new UndefinedArgument();
          }

          return Api.getS3FileUrl({ id }, queryConfig)
            .then((url) => fetch(url))
            .then((data) => data.blob());
        },
        enabled: Boolean(id) && enabled,
        ...defaultOptions,
      }),
  };
};

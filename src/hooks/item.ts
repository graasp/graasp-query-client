import { List, Map } from 'immutable';
import { QueryClient, useQuery, UseQueryResult } from 'react-query';
import * as Api from '../api';
import { DEFAULT_THUMBNAIL_SIZES } from '../config/constants';
import {
  buildFileContentKey,
  buildItemChildrenKey,
  buildItemKey,
  buildItemLoginKey,
  buildItemMembershipsKey,
  buildItemParentsKey,
  buildItemsChildrenKey,
  buildItemsKey,
  buildManyItemMembershipsKey,
  buildPublicItemsWithTagKey,
  buildItemThumbnailKey,
  OWN_ITEMS_KEY,
  RECYCLED_ITEMS_KEY,
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
      options?: {
        enabled?: boolean;
        ordered?: boolean;
        getUpdates?: boolean;
        placeholderData?: List<Item>;
      },
    ): UseQueryResult<List<Item>> => {
      const enabled = options?.enabled ?? true;
      const ordered = options?.ordered ?? true;
      const getUpdates = options?.getUpdates ?? enableWebsocket;

      itemWsHooks?.useChildrenUpdates(enabled && getUpdates ? id : null);

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
        placeholderData: options?.placeholderData,
      });
    },

    useItemsChildren: (
      ids: UUID[],
      options?: {
        enabled?: boolean;
        ordered?: boolean;
        getUpdates?: boolean;
        placeholderData?: List<Item>[];
      },
    ): UseQueryResult<List<Item>[]> => {
      const enabled = options?.enabled ?? true;
      const ordered = options?.ordered ?? true;

      return useQuery({
        queryKey: buildItemsChildrenKey(ids),
        queryFn: () =>
          Promise.all(
            ids.map((id) =>
              Api.getChildren(id, ordered, queryConfig).then((data) =>
                List(data),
              ),
            ),
          ),
        onSuccess: async (items: List<Item>[]) => {
          /* Because the query function loops over the ids, this returns an array 
          of immutable list of items, each list correspond to an item and contains 
          their children */
          if (items.length) {
            // For each item, get the list of its childrens
            items.forEach((item) => {
              // If the item has children, save them in query client
              if (item.size) {
                item.forEach((child) => {
                  const { id } = child;
                  queryClient.setQueryData(buildItemKey(id), Map(child));
                });
              }
            });
          }
        },
        ...defaultOptions,
        enabled: Boolean(ids) && enabled,
        placeholderData: options?.placeholderData,
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

    useItem: (
      id?: UUID,
      // todo: directly provide a Map<Item>
      options?: {
        getUpdates?: boolean;
        placeholderData?: Item;
        withMemberships?: boolean;
      },
    ) => {
      const getUpdates = options?.getUpdates ?? enableWebsocket;

      itemWsHooks?.useItemUpdates(getUpdates ? id : null);

      return useQuery({
        queryKey: buildItemKey(id),
        queryFn: () => {
          if (!id) {
            throw new UndefinedArgument();
          }
          return Api.getItem(
            id,
            { withMemberships: options?.withMemberships },
            queryConfig,
          ).then((data) => Map(data));
        },
        enabled: Boolean(id),
        ...defaultOptions,
        placeholderData: options?.placeholderData
          ? Map(options?.placeholderData)
          : undefined,
      });
    },

    // todo: add optimisation to avoid fetching items already in cache
    useItems: (
      ids: UUID[],
      options?: { getUpdates?: boolean; withMemberships?: boolean },
    ) => {
      const getUpdates = options?.getUpdates ?? enableWebsocket;

      itemWsHooks?.useItemsUpdates(getUpdates ? ids : null);

      return useQuery({
        queryKey: buildItemsKey(ids),
        queryFn: () =>
          // eslint-disable-next-line no-nested-ternary
          ids
            ? ids.length === 1
              ? Api.getItem(
                  ids[0],
                  { withMemberships: options?.withMemberships ?? false },
                  queryConfig,
                ).then((data) => List([data]))
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

    useItemMemberships: (ids?: UUID[], options?: { getUpdates?: boolean }) => {
      const getUpdates = options?.getUpdates ?? enableWebsocket;

      membershipWsHooks?.useItemMembershipsUpdates(getUpdates ? ids : null);

      return useQuery({
        queryKey: buildManyItemMembershipsKey(ids),
        queryFn: () => {
          if (!ids) {
            throw new UndefinedArgument();
          }

          return Api.getMembershipsForItems(ids, queryConfig).then((data) =>
            List(data),
          );
        },
        onSuccess: async (memberships) => {
          // save memberships in their own key
          ids?.forEach(async (id, idx) => {
            queryClient.setQueryData(
              buildItemMembershipsKey(id),
              List(memberships[idx]),
            );
          });
        },
        enabled: Boolean(ids?.length) && ids?.every((id) => Boolean(id)),
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
          return Api.getFileContent({ id }, queryConfig).then((data) => data);
        },
        enabled: Boolean(id) && enabled,
        ...defaultOptions,
      }),

    useRecycledItems: () =>
      useQuery({
        queryKey: RECYCLED_ITEMS_KEY,
        queryFn: () =>
          Api.getRecycledItems(queryConfig).then((data) => List(data)),
        onSuccess: async (items: List<Item>) => {
          // save items in their own key
          // eslint-disable-next-line no-unused-expressions
          items?.forEach(async (item) => {
            const { id } = item;
            queryClient.setQueryData(buildItemKey(id), Map(item));
          });
        },
        ...defaultOptions,
      }),

    usePublicItemsWithTag: (
      tagId?: UUID,
      options?: { withMemberships?: boolean; placeholderData?: List<Item> },
    ) => {
      const placeholderData = options?.placeholderData;
      const withMemberships = options?.withMemberships;
      return useQuery({
        queryKey: buildPublicItemsWithTagKey(tagId),
        queryFn: () => {
          if (!tagId) {
            throw new UndefinedArgument();
          }

          return Api.getPublicItemsWithTag(
            { tagId, withMemberships },
            queryConfig,
          ).then((data) => List(data));
        },
        onSuccess: async (items: List<Item>) => {
          // save items in their own key
          // eslint-disable-next-line no-unused-expressions
          items?.forEach(async (item) => {
            const { id } = item;
            queryClient.setQueryData(buildItemKey(id), Map(item));
          });
        },
        ...defaultOptions,
        placeholderData,
        enabled: Boolean(tagId),
      });
    },

    useItemThumbnail: ({
      id,
      size = DEFAULT_THUMBNAIL_SIZES,
    }: {
      id?: UUID;
      size?: string;
    }) =>
      useQuery({
        queryKey: buildItemThumbnailKey({ id, size }),
        queryFn: async () => {
          if (!id) {
            throw new UndefinedArgument();
          }
          const data = await Api.downloadItemThumbnail(
            { id, size },
            queryConfig,
          );
          return data.blob();
        },
        ...defaultOptions,
        enabled: Boolean(id),
      }),
  };
};

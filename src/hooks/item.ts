import { List, Map, Record } from 'immutable';
import { QueryClient, useQuery, UseQueryResult } from 'react-query';
import * as Api from '../api';
import { DEFAULT_THUMBNAIL_SIZES } from '../config/constants';
import {
  buildFileContentKey,
  buildItemChildrenKey,
  buildItemKey,
  buildItemLoginKey,
  buildItemParentsKey,
  buildItemsChildrenKey,
  buildItemsKey,
  buildPublicItemsWithTagKey,
  buildItemThumbnailKey,
  OWN_ITEMS_KEY,
  RECYCLED_ITEMS_KEY,
  SHARED_ITEMS_KEY,
} from '../config/keys';
import { getOwnItemsRoutine } from '../routines';
import {
  Item,
  Member,
  QueryClientConfig,
  UndefinedArgument,
  UUID,
} from '../types';
import { configureWsItemHooks } from '../ws';
import { WebsocketClient } from '../ws/ws-client';

export default (
  queryClient: QueryClient,
  queryConfig: QueryClientConfig,
  useCurrentMember: () => UseQueryResult,
  websocketClient?: WebsocketClient,
) => {
  const { retry, cacheTime, staleTime, enableWebsocket, notifier } =
    queryConfig;
  const defaultOptions = {
    retry,
    cacheTime,
    staleTime,
  };

  const itemWsHooks =
    enableWebsocket && websocketClient // required to type-check non-null
      ? configureWsItemHooks(queryClient, websocketClient)
      : undefined;

  return {
    useOwnItems: (options?: { getUpdates?: boolean }) => {
      const getUpdates = options?.getUpdates ?? enableWebsocket;

      const { data: currentMember } = useCurrentMember();
      itemWsHooks?.useOwnItemsUpdates(
        getUpdates ? (currentMember as Record<Member>)?.get('id') : null,
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
        onError: (error) => {
          notifier?.({ type: getOwnItemsRoutine.FAILURE, payload: { error } });
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
        getUpdates ? (currentMember as Record<Member>)?.get('id') : null,
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
          return Api.getItem(id, queryConfig).then((data) => Map(data));
        },
        enabled: Boolean(id),
        ...defaultOptions,
        placeholderData: options?.placeholderData
          ? Map(options?.placeholderData)
          : undefined,
      });
    },

    // todo: add optimisation to avoid fetching items already in cache
    useItems: (ids: UUID[], options?: { getUpdates?: boolean }) => {
      const getUpdates = options?.getUpdates ?? enableWebsocket;

      itemWsHooks?.useItemsUpdates(getUpdates ? ids : null);

      return useQuery({
        queryKey: buildItemsKey(ids),
        queryFn: () =>
          // eslint-disable-next-line no-nested-ternary
          ids
            ? ids.length === 1
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
      options?: { placeholderData?: List<Item> },
    ) => {
      const placeholderData = options?.placeholderData;
      return useQuery({
        queryKey: buildPublicItemsWithTagKey(tagId),
        queryFn: () => {
          if (!tagId) {
            throw new UndefinedArgument();
          }

          return Api.getPublicItemsWithTag({ tagId }, queryConfig).then(
            (data) => List(data),
          );
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
    }) => {
      let shouldFetch = true;
      if (id) {
        shouldFetch =
          queryClient
            .getQueryData<Record<Item>>(buildItemKey(id))
            ?.get('settings')?.hasThumbnail ?? true;
      }
      return useQuery({
        queryKey: buildItemThumbnailKey({ id, size }),
        queryFn: async () => {
          if (!id) {
            throw new UndefinedArgument();
          }
          return Api.downloadItemThumbnail({ id, size }, queryConfig);
        },
        ...defaultOptions,
        enabled: Boolean(id) && shouldFetch,
      });
    },
  };
};

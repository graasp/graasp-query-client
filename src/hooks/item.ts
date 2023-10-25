import {
  DiscriminatedItem,
  Etherpad,
  EtherpadItemType,
  Item,
  ItemType,
  MAX_TARGETS_FOR_READ_REQUEST,
  Member,
  RecycledItemData,
  ResultOf,
  UUID,
} from '@graasp/sdk';
import { WebsocketClient } from '@graasp/sdk/frontend';

import {
  UseQueryResult,
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from 'react-query';

import * as Api from '../api';
import { splitRequestByIds } from '../api/axios';
import {
  CONSTANT_KEY_CACHE_TIME_MILLISECONDS,
  DEFAULT_THUMBNAIL_SIZE,
  PAGINATED_ITEMS_PER_PAGE,
  STALE_TIME_CHILDREN_PAGINATED_MILLISECONDS,
} from '../config/constants';
import { UndefinedArgument } from '../config/errors';
import {
  OWN_ITEMS_KEY,
  RECYCLED_ITEMS_DATA_KEY,
  RECYCLED_ITEMS_KEY,
  SHARED_ITEMS_KEY,
  buildEtherpadKey,
  buildFileContentKey,
  buildItemChildrenKey,
  buildItemDescendantsKey,
  buildItemKey,
  buildItemPaginatedChildrenKey,
  buildItemParentsKey,
  buildItemThumbnailKey,
  buildItemsKey,
} from '../config/keys';
import { getOwnItemsRoutine } from '../routines';
import { QueryClientConfig } from '../types';
import { isPaginatedChildrenDataEqual, paginate } from '../utils/util';
import { configureWsItemHooks } from '../ws';

export default (
  queryConfig: QueryClientConfig,
  useCurrentMember: () => UseQueryResult<Member>,
  websocketClient?: WebsocketClient,
) => {
  const { enableWebsocket, notifier, defaultQueryOptions } = queryConfig;

  const itemWsHooks =
    enableWebsocket && websocketClient // required to type-check non-null
      ? configureWsItemHooks(websocketClient, notifier)
      : undefined;

  return {
    useOwnItems: (options?: { getUpdates?: boolean }) => {
      const queryClient = useQueryClient();
      const getUpdates = options?.getUpdates ?? enableWebsocket;

      const { data: currentMember } = useCurrentMember();
      itemWsHooks?.useOwnItemsUpdates(getUpdates ? currentMember?.id : null);

      return useQuery({
        queryKey: OWN_ITEMS_KEY,
        queryFn: (): Promise<Item[]> =>
          Api.getOwnItems(queryConfig).then((data) => data),
        onSuccess: async (items: Item[]) => {
          // save items in their own key
          // eslint-disable-next-line no-unused-expressions
          items?.forEach(async (item) => {
            const { id } = item;
            queryClient.setQueryData(buildItemKey(id), item);
          });
        },
        onError: (error) => {
          notifier?.({ type: getOwnItemsRoutine.FAILURE, payload: { error } });
        },
        ...defaultQueryOptions,
      });
    },

    useChildren: (
      id?: UUID,
      options?: {
        enabled?: boolean;
        ordered?: boolean;
        getUpdates?: boolean;
        placeholderData?: Item[];
      },
    ) => {
      const enabled = options?.enabled ?? true;
      const ordered = options?.ordered ?? true;
      const getUpdates = options?.getUpdates ?? enableWebsocket;

      itemWsHooks?.useChildrenUpdates(enabled && getUpdates ? id : null);
      const queryClient = useQueryClient();

      return useQuery({
        queryKey: buildItemChildrenKey(id),
        queryFn: (): Promise<Item[]> => {
          if (!id) {
            throw new UndefinedArgument();
          }
          return Api.getChildren(id, ordered, queryConfig).then((data) => data);
        },
        onSuccess: async (items: Item[]) => {
          if (items?.length) {
            // save items in their own key
            items.forEach(async (item) => {
              const { id: itemId } = item;
              queryClient.setQueryData(buildItemKey(itemId), item);
            });
          }
        },
        ...defaultQueryOptions,
        enabled: Boolean(id) && enabled,
        placeholderData: options?.placeholderData,
      });
    },

    useChildrenPaginated: (
      id: UUID | undefined,
      children: Item[],
      options?: {
        enabled?: boolean;
        itemsPerPage?: number;
        filterFunction?: (items: Item[]) => Item[];
      },
    ) => {
      const enabled = options?.enabled;

      const childrenPaginatedOptions = {
        ...defaultQueryOptions,
        staleTime: STALE_TIME_CHILDREN_PAGINATED_MILLISECONDS,
        isDataEqual: isPaginatedChildrenDataEqual,
      };

      return useInfiniteQuery(
        buildItemPaginatedChildrenKey(id),
        ({ pageParam = 1 }) =>
          paginate(
            children,
            options?.itemsPerPage || PAGINATED_ITEMS_PER_PAGE,
            pageParam,
            options?.filterFunction,
          ),
        {
          enabled,
          getNextPageParam: (lastPage) => {
            const { pageNumber } = lastPage;
            if (pageNumber !== -1) {
              return pageNumber + 1;
            }
            return undefined;
          },
          ...childrenPaginatedOptions,
        },
      );
    },

    /**
     * return parents for given item id
     * @param id {string} item id
     * @param path {string} item path, used to prevent fetching if no parent is defined
     * @returns immutable list of parent items
     */
    useParents: ({
      id,
      path,
      enabled,
    }: {
      id?: UUID;
      path?: string;
      enabled?: boolean;
    }) => {
      const queryClient = useQueryClient();
      return useQuery({
        queryKey: buildItemParentsKey(id),
        queryFn: (): Promise<Item[]> => {
          if (!id) {
            throw new UndefinedArgument();
          }

          return Api.getParents({ id, path }, queryConfig).then(
            (items) => items,
          );
        },
        onSuccess: async (items: Item[]) => {
          if (items?.length) {
            // save items in their own key
            items.forEach(async (item) => {
              const { id: itemId } = item;
              queryClient.setQueryData(buildItemKey(itemId), item);
            });
          }
        },
        ...defaultQueryOptions,
        enabled: enabled && Boolean(id),
      });
    },

    useDescendants: ({ id, enabled }: { id: UUID; enabled?: boolean }) => {
      const queryClient = useQueryClient();
      return useQuery({
        queryKey: buildItemDescendantsKey(id),
        queryFn: (): Promise<Item[]> =>
          Api.getDescendants({ id }, queryConfig).then((items) => items),
        onSuccess: async (items: Item[]) => {
          if (items?.length) {
            // save items in their own key
            items.forEach(async (item) => {
              const { id: itemId } = item;
              queryClient.setQueryData(buildItemKey(itemId), item);
            });
          }
        },
        ...defaultQueryOptions,
        enabled: enabled && Boolean(id),
      });
    },

    useSharedItems: (options?: { getUpdates?: boolean }) => {
      const getUpdates = options?.getUpdates ?? enableWebsocket;

      const { data: currentMember } = useCurrentMember();
      itemWsHooks?.useSharedItemsUpdates(getUpdates ? currentMember?.id : null);

      const queryClient = useQueryClient();
      return useQuery({
        queryKey: SHARED_ITEMS_KEY,
        queryFn: (): Promise<Item[]> =>
          Api.getSharedItems(queryConfig).then((data) => data),
        onSuccess: async (items: Item[]) => {
          // save items in their own key
          items.forEach(async (item) => {
            const { id } = item;
            queryClient.setQueryData(buildItemKey(id), item);
          });
        },
        ...defaultQueryOptions,
      });
    },

    useItem: (
      id?: UUID,
      options?: {
        getUpdates?: boolean;
        placeholderData?: Item;
      },
    ): UseQueryResult<Item> => {
      const getUpdates = options?.getUpdates ?? enableWebsocket;
      itemWsHooks?.useItemUpdates(getUpdates ? id : null);

      return useQuery({
        queryKey: buildItemKey(id),
        queryFn: (): Promise<Item> => {
          if (!id) {
            throw new UndefinedArgument();
          }
          return Api.getItem(id, queryConfig).then((data) => data);
        },
        enabled: Boolean(id),
        ...defaultQueryOptions,
        placeholderData: options?.placeholderData
          ? options?.placeholderData
          : undefined,
      });
    },

    // todo: add optimisation to avoid fetching items already in cache
    useItems: (
      ids: UUID[],
      options?: { getUpdates?: boolean },
    ): UseQueryResult<ResultOf<DiscriminatedItem>> => {
      const getUpdates = options?.getUpdates ?? enableWebsocket;

      itemWsHooks?.useItemsUpdates(getUpdates ? ids : null);

      const queryClient = useQueryClient();
      return useQuery({
        queryKey: buildItemsKey(ids),
        queryFn: () => {
          if (!ids) {
            throw new UndefinedArgument();
          }
          return splitRequestByIds(
            ids,
            MAX_TARGETS_FOR_READ_REQUEST,
            (chunk) => Api.getItems(chunk, queryConfig),
            true,
          );
        },
        onSuccess: async (items) => {
          // save items in their own key
          Object.values(items?.data)?.forEach(async (item) => {
            const { id } = item;
            queryClient.setQueryData(buildItemKey(id), item);
          });
        },
        enabled: ids && Boolean(ids.length) && ids.every((id) => Boolean(id)),
        ...defaultQueryOptions,
      });
    },

    /**
     * @deprecated use url alternative when possible
     * @param id itemId to download content from
     * @returns Blob of the content
     */
    useFileContent: (
      id?: UUID,
      { enabled = true }: { enabled?: boolean } = {},
    ) =>
      useQuery({
        queryKey: buildFileContentKey({ id, replyUrl: false }),
        queryFn: (): Promise<Blob> => {
          if (!id) {
            throw new UndefinedArgument();
          }
          return Api.getFileContent(id, queryConfig);
        },
        enabled: Boolean(id) && enabled,
        ...defaultQueryOptions,
        cacheTime: CONSTANT_KEY_CACHE_TIME_MILLISECONDS,
      }),

    useFileContentUrl: (
      id?: UUID,
      { enabled = true }: { enabled?: boolean } = {},
    ) =>
      useQuery({
        queryKey: buildFileContentKey({ id, replyUrl: true }),
        queryFn: (): Promise<string> => {
          if (!id) {
            throw new UndefinedArgument();
          }
          return Api.getFileContentUrl(id, queryConfig);
        },
        enabled: Boolean(id) && enabled,
        ...defaultQueryOptions,
        cacheTime: CONSTANT_KEY_CACHE_TIME_MILLISECONDS,
      }),

    useRecycledItems: (options?: { getUpdates?: boolean }) => {
      const getUpdates = options?.getUpdates ?? enableWebsocket;

      const { data: currentMember } = useCurrentMember();
      itemWsHooks?.useRecycledItemsUpdates(
        getUpdates ? currentMember?.id : null,
      );

      return useQuery({
        queryKey: RECYCLED_ITEMS_KEY,
        queryFn: (): Promise<Item[]> =>
          Api.getRecycledItemsData(queryConfig).then(
            (data) => data?.map(({ item }: RecycledItemData) => item),
          ),
        ...defaultQueryOptions,
      });
    },

    useRecycledItemsData: () => {
      const queryClient = useQueryClient();
      return useQuery({
        queryKey: RECYCLED_ITEMS_DATA_KEY,
        queryFn: (): Promise<RecycledItemData[]> =>
          Api.getRecycledItemsData(queryConfig).then((data) => data),
        onSuccess: async (items) => {
          // save items in their own key
          // eslint-disable-next-line no-unused-expressions
          items?.forEach(async (item) => {
            const { item: recycledItem } = item;
            queryClient.setQueryData(
              buildItemKey(recycledItem.id),
              recycledItem,
            );
          });
        },
        ...defaultQueryOptions,
      });
    },

    useItemThumbnail: ({
      id,
      size = DEFAULT_THUMBNAIL_SIZE,
    }: {
      id?: UUID;
      size?: string;
    }) => {
      const queryClient = useQueryClient();
      let shouldFetch = true;
      if (id) {
        shouldFetch =
          queryClient.getQueryData<Item>(buildItemKey(id))?.settings
            ?.hasThumbnail ?? true;
      }
      return useQuery({
        queryKey: buildItemThumbnailKey({ id, size, replyUrl: false }),
        queryFn: (): Promise<Blob> => {
          if (!id) {
            throw new UndefinedArgument();
          }
          return Api.downloadItemThumbnail({ id, size }, queryConfig);
        },
        ...defaultQueryOptions,
        enabled: Boolean(id) && shouldFetch,
        cacheTime: CONSTANT_KEY_CACHE_TIME_MILLISECONDS,
      });
    },

    // create a new thumbnail hook because of key content
    useItemThumbnailUrl: ({
      id,
      size = DEFAULT_THUMBNAIL_SIZE,
    }: {
      id?: UUID;
      size?: string;
    }) => {
      const queryClient = useQueryClient();
      let shouldFetch = true;
      if (id) {
        shouldFetch =
          queryClient.getQueryData<Item>(buildItemKey(id))?.settings
            ?.hasThumbnail ?? true;
      }
      return useQuery({
        queryKey: buildItemThumbnailKey({ id, size, replyUrl: true }),
        queryFn: (): Promise<string> => {
          if (!id) {
            throw new UndefinedArgument();
          }
          return Api.downloadItemThumbnailUrl({ id, size }, queryConfig);
        },
        ...defaultQueryOptions,
        enabled: Boolean(id) && shouldFetch,
        cacheTime: CONSTANT_KEY_CACHE_TIME_MILLISECONDS,
      });
    },

    useEtherpad: (item: EtherpadItemType | undefined, mode: 'read' | 'write') =>
      useQuery({
        queryKey: buildEtherpadKey(item?.id),
        queryFn: (): Promise<Etherpad> => {
          if (item?.type !== ItemType.ETHERPAD) {
            throw new Error('Item is not an etherpad item');
          }

          if (!item.id) {
            throw new UndefinedArgument();
          }
          return Api.getEtherpad({ itemId: item.id, mode }, queryConfig).then(
            (data) => data,
          );
        },
        enabled: Boolean(item?.id),
        ...defaultQueryOptions,
      }),

    useItemFeedbackUpdates: itemWsHooks?.useItemFeedbackUpdates,
  };
};

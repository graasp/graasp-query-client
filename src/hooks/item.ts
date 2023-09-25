import {
  DiscriminatedItem,
  Item,
  ItemType,
  MAX_TARGETS_FOR_READ_REQUEST,
  UUID,
  convertJs,
} from '@graasp/sdk';
import {
  EtherpadRecord,
  ItemRecord,
  MemberRecord,
  RecycledItemDataRecord,
  ResultOfRecord,
} from '@graasp/sdk/frontend';

import { List } from 'immutable';
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
  RECYCLED_ITEMS_DATA_KEY,
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
  buildOwnItemsKey,
} from '../config/keys';
import { getOwnItemsRoutine } from '../routines';
import { Paginated, PaginationArgs, QueryClientConfig } from '../types';
import { isPaginatedChildrenDataEqual, paginate } from '../utils/util';
import { configureWsItemHooks } from '../ws';
import { WebsocketClient } from '../ws/ws-client';

export default (
  queryConfig: QueryClientConfig,
  useCurrentMember: () => UseQueryResult<MemberRecord>,
  websocketClient?: WebsocketClient,
) => {
  const { enableWebsocket, notifier, defaultQueryOptions } = queryConfig;

  const itemWsHooks =
    enableWebsocket && websocketClient // required to type-check non-null
      ? configureWsItemHooks(websocketClient)
      : undefined;

  return {
    useOwnItems: (
      args: PaginationArgs,
      searchArgs?: {
        name: string;
      },
      options?: { getUpdates?: boolean },
    ) => {
      const queryClient = useQueryClient();
      const getUpdates = options?.getUpdates ?? enableWebsocket;

      const { data: currentMember } = useCurrentMember();
      itemWsHooks?.useOwnItemsUpdates(getUpdates ? currentMember?.id : null);

      return useQuery({
        queryKey: buildOwnItemsKey(args, searchArgs),
        queryFn: (): Promise<Paginated<Item>> =>
          Api.getOwnItems(queryConfig, args, searchArgs).then((data) =>
            convertJs(data),
          ),
        onSuccess: async ({ data }: Paginated<Item>) => {
          data.forEach(async (item) => {
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
        placeholderData?: List<ItemRecord>;
      },
    ) => {
      const enabled = options?.enabled ?? true;
      const ordered = options?.ordered ?? true;
      const getUpdates = options?.getUpdates ?? enableWebsocket;

      itemWsHooks?.useChildrenUpdates(enabled && getUpdates ? id : null);
      const queryClient = useQueryClient();

      return useQuery({
        queryKey: buildItemChildrenKey(id),
        queryFn: (): Promise<List<ItemRecord>> => {
          if (!id) {
            throw new UndefinedArgument();
          }
          return Api.getChildren(id, ordered, queryConfig).then((data) =>
            convertJs(data),
          );
        },
        onSuccess: async (items: List<ItemRecord>) => {
          if (items?.size) {
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
      children: List<ItemRecord>,
      options?: {
        enabled?: boolean;
        itemsPerPage?: number;
        filterFunction?: (items: List<ItemRecord>) => List<ItemRecord>;
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
        queryFn: (): Promise<List<ItemRecord>> => {
          if (!id) {
            throw new UndefinedArgument();
          }

          return Api.getParents({ id, path }, queryConfig).then((items) =>
            convertJs(items),
          );
        },
        onSuccess: async (items: List<ItemRecord>) => {
          if (items?.size) {
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
        queryFn: (): Promise<List<ItemRecord>> =>
          Api.getDescendants({ id }, queryConfig).then((items) =>
            convertJs(items),
          ),
        onSuccess: async (items: List<ItemRecord>) => {
          if (items?.size) {
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
        queryFn: (): Promise<List<ItemRecord>> =>
          Api.getSharedItems(queryConfig).then((data) => convertJs(data)),
        onSuccess: async (items: List<ItemRecord>) => {
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
        placeholderData?: ItemRecord;
      },
    ): UseQueryResult<ItemRecord> => {
      const getUpdates = options?.getUpdates ?? enableWebsocket;
      itemWsHooks?.useItemUpdates(getUpdates ? id : null);

      return useQuery({
        queryKey: buildItemKey(id),
        queryFn: (): Promise<ItemRecord> => {
          if (!id) {
            throw new UndefinedArgument();
          }
          return Api.getItem(id, queryConfig).then((data) => convertJs(data));
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
    ): UseQueryResult<ResultOfRecord<DiscriminatedItem>> => {
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
          items?.data?.toSeq()?.forEach(async (item) => {
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

    useRecycledItemsData: () => {
      const queryClient = useQueryClient();
      return useQuery({
        queryKey: RECYCLED_ITEMS_DATA_KEY,
        queryFn: (): Promise<List<RecycledItemDataRecord>> =>
          Api.getRecycledItemsData(queryConfig).then((data) => convertJs(data)),
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
          queryClient.getQueryData<ItemRecord>(buildItemKey(id))?.settings
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
          queryClient.getQueryData<ItemRecord>(buildItemKey(id))?.settings
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

    useEtherpad: (
      item: DiscriminatedItem | ItemRecord | undefined,
      mode: 'read' | 'write',
    ) =>
      useQuery({
        queryKey: buildEtherpadKey(item?.id),
        queryFn: (): Promise<EtherpadRecord> => {
          if (item?.type !== ItemType.ETHERPAD) {
            throw new Error('Item is not an etherpad item');
          }

          if (!item.id) {
            throw new UndefinedArgument();
          }
          return Api.getEtherpad({ itemId: item.id, mode }, queryConfig).then(
            (data) => convertJs(data),
          );
        },
        enabled: Boolean(item?.id),
        ...defaultQueryOptions,
      }),
  };
};

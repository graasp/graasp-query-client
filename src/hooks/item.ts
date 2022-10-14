import { List, RecordOf } from 'immutable';
import {
  QueryClient,
  UseQueryResult,
  useInfiniteQuery,
  useQuery,
} from 'react-query';

import { MAX_TARGETS_FOR_READ_REQUEST, convertJs } from '@graasp/sdk';

import * as Api from '../api';
import { splitRequestByIds } from '../api/axios';
import {
  CONSTANT_KEY_CACHE_TIME_MILLISECONDS,
  DEFAULT_THUMBNAIL_SIZES,
  PAGINATED_ITEMS_PER_PAGE,
  STALE_TIME_CHILDREN_PAGINATED_MILLISECONDS,
} from '../config/constants';
import { UndefinedArgument } from '../config/errors';
import {
  OWN_ITEMS_KEY,
  RECYCLED_ITEMS_KEY,
  SHARED_ITEMS_KEY,
  buildFileContentKey,
  buildItemChildrenKey,
  buildItemKey,
  buildItemLoginKey,
  buildItemPaginatedChildrenKey,
  buildItemParentsKey,
  buildItemThumbnailKey,
  buildItemsChildrenKey,
  buildItemsKey,
  buildPublicItemsWithTagKey,
} from '../config/keys';
import { getOwnItemsRoutine } from '../routines';
import {
  ItemLoginRecord,
  ItemRecord,
  MemberRecord,
  QueryClientConfig,
  UUID,
} from '../types';
import { isPaginatedChildrenDataEqual, paginate } from '../utils/util';
import { configureWsItemHooks } from '../ws';
import { WebsocketClient } from '../ws/ws-client';

export default (
  queryClient: QueryClient,
  queryConfig: QueryClientConfig,
  useCurrentMember: () => UseQueryResult<MemberRecord, Error>,
  websocketClient?: WebsocketClient,
) => {
  const { enableWebsocket, notifier, defaultQueryOptions } = queryConfig;

  const itemWsHooks =
    enableWebsocket && websocketClient // required to type-check non-null
      ? configureWsItemHooks(queryClient, websocketClient)
      : undefined;

  return {
    useOwnItems: (options?: { getUpdates?: boolean }) => {
      const getUpdates = options?.getUpdates ?? enableWebsocket;

      const { data: currentMember } = useCurrentMember();
      itemWsHooks?.useOwnItemsUpdates(getUpdates ? currentMember?.id : null);

      return useQuery({
        queryKey: OWN_ITEMS_KEY,
        queryFn: (): Promise<List<ItemRecord>> =>
          Api.getOwnItems(queryConfig).then((data) => convertJs(data)),
        onSuccess: async (items: List<ItemRecord>) => {
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
      id: UUID | undefined,
      options?: {
        enabled?: boolean;
        ordered?: boolean;
        getUpdates?: boolean;
        placeholderData?: List<ItemRecord>;
      },
    ): UseQueryResult<List<ItemRecord>> => {
      const enabled = options?.enabled ?? true;
      const ordered = options?.ordered ?? true;
      const getUpdates = options?.getUpdates ?? enableWebsocket;

      itemWsHooks?.useChildrenUpdates(enabled && getUpdates ? id : null);

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
      children: List<RecordOf<any>>,
      options?: {
        enabled?: boolean;
        itemsPerPage?: number;
        filterFunction?: (item: List<RecordOf<any>>) => List<RecordOf<any>>;
      },
    ): UseQueryResult<any> => {
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
          getNextPageParam: (lastPage: RecordOf<any>) => {
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

    useItemsChildren: (
      ids: UUID[],
      options?: {
        enabled?: boolean;
        ordered?: boolean;
        getUpdates?: boolean;
        placeholderData?: List<List<ItemRecord>>;
      },
    ): UseQueryResult<List<List<ItemRecord>>> => {
      const enabled = options?.enabled ?? true;
      const ordered = options?.ordered ?? true;

      return useQuery({
        queryKey: buildItemsChildrenKey(ids),
        queryFn: (): Promise<List<List<ItemRecord>>> =>
          Promise.all(
            ids.map((id) =>
              Api.getChildren(id, ordered, queryConfig).then((data) =>
                convertJs(data),
              ),
            ),
          ).then((items) => List(items)),
        onSuccess: async (items: List<List<ItemRecord>>) => {
          /* Because the query function loops over the ids, this returns an array 
          of immutable list of items, each list correspond to an item and contains 
          their children */
          if (items.size) {
            // For each item, get the list of its childrens
            items.forEach((item) => {
              // If the item has children, save them in query client
              if (item.size) {
                item.forEach((child) => {
                  const { id } = child;
                  queryClient.setQueryData(buildItemKey(id), child);
                });
              }
            });
          }
        },
        ...defaultQueryOptions,
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
        queryFn: (): Promise<List<ItemRecord>> =>
          Api.getParents({ path }, queryConfig).then((data) => convertJs(data)),
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
      }),

    useSharedItems: (options?: { getUpdates?: boolean }) => {
      const getUpdates = options?.getUpdates ?? enableWebsocket;

      const { data: currentMember } = useCurrentMember();
      itemWsHooks?.useSharedItemsUpdates(getUpdates ? currentMember?.id : null);

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
    ) => {
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
    useItems: (ids: UUID[], options?: { getUpdates?: boolean }) => {
      const getUpdates = options?.getUpdates ?? enableWebsocket;

      itemWsHooks?.useItemsUpdates(getUpdates ? ids : null);

      return useQuery({
        queryKey: buildItemsKey(ids),
        queryFn: (): Promise<List<ItemRecord>> => {
          if (!ids) {
            throw new UndefinedArgument();
          }
          if (ids.length === 1) {
            return Api.getItem(ids[0], queryConfig).then((data) =>
              convertJs([data]),
            );
          }

          return splitRequestByIds(
            ids,
            MAX_TARGETS_FOR_READ_REQUEST,
            (chunk) => Api.getItems(chunk, queryConfig),
            true,
          );
        },
        onSuccess: async (items: List<ItemRecord>) => {
          // save items in their own key
          items?.forEach(async (item) => {
            const { id } = item;
            queryClient.setQueryData(buildItemKey(id), item);
          });
        },
        enabled: ids && Boolean(ids.length) && ids.every((id) => Boolean(id)),
        ...defaultQueryOptions,
      });
    },

    useItemLogin: (id?: UUID) =>
      useQuery({
        queryKey: buildItemLoginKey(id),
        queryFn: (): Promise<ItemLoginRecord> => {
          if (!id) {
            throw new UndefinedArgument();
          }
          return Api.getItemLogin(id, queryConfig).then((data) =>
            convertJs(data),
          );
        },
        enabled: Boolean(id),
        ...defaultQueryOptions,
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
        ...defaultQueryOptions,
        cacheTime: CONSTANT_KEY_CACHE_TIME_MILLISECONDS,
      }),

    useRecycledItems: () =>
      useQuery({
        queryKey: RECYCLED_ITEMS_KEY,
        queryFn: (): Promise<List<ItemRecord>> =>
          Api.getRecycledItems(queryConfig).then((data) => convertJs(data)),
        onSuccess: async (items: List<ItemRecord>) => {
          // save items in their own key
          // eslint-disable-next-line no-unused-expressions
          items?.forEach(async (item) => {
            const { id } = item;
            queryClient.setQueryData(buildItemKey(id), item);
          });
        },
        ...defaultQueryOptions,
      }),

    usePublicItemsWithTag: (
      tagId?: UUID,
      options?: { placeholderData?: List<ItemRecord> },
    ) => {
      const placeholderData = options?.placeholderData;
      return useQuery({
        queryKey: buildPublicItemsWithTagKey(tagId),
        queryFn: (): Promise<List<ItemRecord>> => {
          if (!tagId) {
            throw new UndefinedArgument();
          }

          return Api.getPublicItemsWithTag({ tagId }, queryConfig).then(
            (data) => convertJs(data),
          );
        },
        onSuccess: async (items: List<ItemRecord>) => {
          // save items in their own key
          // eslint-disable-next-line no-unused-expressions
          items?.forEach(async (item) => {
            const { id } = item;
            queryClient.setQueryData(buildItemKey(id), item);
          });
        },
        ...defaultQueryOptions,
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
          queryClient.getQueryData<ItemRecord>(buildItemKey(id))?.settings
            ?.hasThumbnail ?? true;
      }
      return useQuery({
        queryKey: buildItemThumbnailKey({ id, size }),
        queryFn: async () => {
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
  };
};

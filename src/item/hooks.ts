import {
  MAX_TARGETS_FOR_READ_REQUEST,
  PackedItem,
  UUID,
  WebsocketClient,
} from '@graasp/sdk';

import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { splitRequestByIdsAndReturn } from '../api/axios.js';
import {
  CONSTANT_KEY_STALE_TIME_MILLISECONDS,
  PAGINATED_ITEMS_PER_PAGE,
} from '../config/constants.js';
import { UndefinedArgument } from '../config/errors.js';
import useDebounce from '../hooks/useDebounce.js';
import { OWN_ITEMS_KEY, itemKeys, memberKeys } from '../keys.js';
import { QueryClientConfig } from '../types.js';
import { paginate } from '../utils/util.js';
import { configureWsItemHooks } from '../ws/index.js';
import {
  useAccessibleItems,
  useInfiniteAccessibleItems,
} from './accessible/hooks.js';
import * as Api from './api.js';
import { useDescendants } from './descendants/hooks.js';
import { getOwnItemsRoutine } from './routines.js';
import { useItemThumbnail, useItemThumbnailUrl } from './thumbnail/hooks.js';
import { ItemChildrenParams } from './types.js';

const config = (
  queryConfig: QueryClientConfig,
  websocketClient?: WebsocketClient,
) => {
  const { enableWebsocket, notifier, defaultQueryOptions } = queryConfig;

  const itemWsHooks =
    enableWebsocket && websocketClient // required to type-check non-null
      ? configureWsItemHooks(websocketClient, notifier)
      : undefined;

  return {
    useAccessibleItems: useAccessibleItems(queryConfig),
    useInfiniteAccessibleItems: useInfiniteAccessibleItems(queryConfig),

    /** @deprecated use useAccessibleItems */
    useOwnItems: () =>
      useQuery({
        queryKey: OWN_ITEMS_KEY,
        queryFn: () => Api.getOwnItems(queryConfig),
        onError: (error) => {
          notifier?.({ type: getOwnItemsRoutine.FAILURE, payload: { error } });
        },
        ...defaultQueryOptions,
      }),

    useChildren: (
      id?: UUID,
      params?: ItemChildrenParams,
      options?: {
        enabled?: boolean;
        getUpdates?: boolean;
        placeholderData?: PackedItem[];
      },
    ) => {
      const enabled = options?.enabled ?? true;
      const ordered = params?.ordered ?? true;

      const queryClient = useQueryClient();

      // cannot debounce on array directly
      const debouncedKeywords = useDebounce(params?.keywords, 500);

      return useQuery({
        queryKey: itemKeys.single(id).children({
          ordered,
          types: params?.types,
          keywords: debouncedKeywords,
        }),
        queryFn: () => {
          if (!id) {
            throw new UndefinedArgument();
          }
          return Api.getChildren(
            id,
            { ...params, ordered, keywords: debouncedKeywords },
            queryConfig,
          );
        },
        onSuccess: async (items) => {
          if (items?.length) {
            // save items in their own key
            items.forEach(async (item) => {
              const { id: itemId } = item;
              queryClient.setQueryData(itemKeys.single(itemId).content, item);
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
      children: PackedItem[],
      options?: {
        enabled?: boolean;
        itemsPerPage?: number;
        filterFunction?: (items: PackedItem[]) => PackedItem[];
      },
    ) => {
      const enabled = options?.enabled;

      const childrenPaginatedOptions = {
        ...defaultQueryOptions,
      };

      return useInfiniteQuery(
        itemKeys.single(id).paginatedChildren,
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
        queryKey: itemKeys.single(id).parents,
        queryFn: () => {
          if (!id) {
            throw new UndefinedArgument();
          }

          return Api.getParents({ id, path }, queryConfig).then(
            (items) => items,
          );
        },
        onSuccess: async (items) => {
          if (items?.length) {
            // save items in their own key
            items.forEach(async (item) => {
              const { id: itemId } = item;
              queryClient.setQueryData(itemKeys.single(itemId).content, item);
            });
          }
        },
        ...defaultQueryOptions,
        enabled: enabled && Boolean(id),
      });
    },

    useDescendants: useDescendants(queryConfig),

    useItem: (
      id?: UUID,
      options?: {
        getUpdates?: boolean;
        placeholderData?: PackedItem;
      },
    ) =>
      useQuery({
        queryKey: itemKeys.single(id).content,
        queryFn: () => {
          if (!id) {
            throw new UndefinedArgument();
          }
          return Api.getItem(id, queryConfig);
        },
        enabled: Boolean(id),
        ...defaultQueryOptions,
        placeholderData: options?.placeholderData
          ? options?.placeholderData
          : undefined,
      }),

    // todo: add optimisation to avoid fetching items already in cache
    useItems: (ids: UUID[]) => {
      const queryClient = useQueryClient();
      return useQuery({
        queryKey: itemKeys.many(ids).content,
        queryFn: () => {
          if (!ids) {
            throw new UndefinedArgument();
          }
          return splitRequestByIdsAndReturn(
            ids,
            MAX_TARGETS_FOR_READ_REQUEST,
            (chunk) => Api.getItems(chunk, queryConfig),
            true,
          );
        },
        onSuccess: async (items) => {
          // save items in their own key
          if (items?.data) {
            Object.values(items?.data)?.forEach(async (item) => {
              const { id } = item;
              queryClient.setQueryData(itemKeys.single(id).content, item);
            });
          }
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
        queryKey: itemKeys.single(id).file({ replyUrl: false }),
        queryFn: () => {
          if (!id) {
            throw new UndefinedArgument();
          }
          return Api.getFileContent(id, queryConfig);
        },
        enabled: Boolean(id) && enabled,
        ...defaultQueryOptions,
        staleTime: CONSTANT_KEY_STALE_TIME_MILLISECONDS,
      }),

    useFileContentUrl: (
      id?: UUID,
      { enabled = true }: { enabled?: boolean } = {},
    ) =>
      useQuery({
        queryKey: itemKeys.single(id).file({ replyUrl: true }),
        queryFn: () => {
          if (!id) {
            throw new UndefinedArgument();
          }
          return Api.getFileContentUrl(id, queryConfig);
        },
        enabled: Boolean(id) && enabled,
        ...defaultQueryOptions,
        staleTime: CONSTANT_KEY_STALE_TIME_MILLISECONDS,
      }),

    useRecycledItems: () =>
      useQuery({
        queryKey: memberKeys.current().recycledItems,
        queryFn: () =>
          Api.getRecycledItemsData(queryConfig).then((data) =>
            data?.map(({ item }) => item),
          ),
        ...defaultQueryOptions,
      }),

    useRecycledItemsData: () => {
      const queryClient = useQueryClient();
      return useQuery({
        queryKey: memberKeys.current().recycled,
        queryFn: () => Api.getRecycledItemsData(queryConfig),
        onSuccess: async (items) => {
          // save items in their own key
          // eslint-disable-next-line no-unused-expressions
          items?.forEach(async (item) => {
            const { item: recycledItem } = item;
            queryClient.setQueryData(
              itemKeys.single(recycledItem.id).content,
              recycledItem,
            );
          });
        },
        ...defaultQueryOptions,
      });
    },

    useItemFeedbackUpdates: itemWsHooks?.useItemFeedbackUpdates,

    useItemThumbnail: useItemThumbnail(queryConfig),
    useItemThumbnailUrl: useItemThumbnailUrl(queryConfig),
  };
};

export default config;

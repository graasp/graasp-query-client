import {
  CompleteMember,
  MAX_TARGETS_FOR_READ_REQUEST,
  PackedItem,
  UUID,
  WebsocketClient,
} from '@graasp/sdk';

import {
  UseQueryResult,
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { splitRequestByIdsAndReturn } from '../api/axios.js';
import * as Api from '../api/item.js';
import { ItemChildrenParams, ItemSearchParams } from '../api/routes.js';
import {
  CONSTANT_KEY_STALE_TIME_MILLISECONDS,
  DEFAULT_THUMBNAIL_SIZE,
  PAGINATED_ITEMS_PER_PAGE,
} from '../config/constants.js';
import { UndefinedArgument } from '../config/errors.js';
import { OWN_ITEMS_KEY, itemKeys, memberKeys } from '../config/keys.js';
import {
  getAccessibleItemsRoutine,
  getOwnItemsRoutine,
} from '../routines/item.js';
import { PaginationParams, QueryClientConfig } from '../types.js';
import { paginate } from '../utils/util.js';
import { configureWsItemHooks } from '../ws/index.js';
import useDebounce from './useDebounce.js';

export default (
  queryConfig: QueryClientConfig,
  useCurrentMember: () => UseQueryResult<CompleteMember | null>,
  websocketClient?: WebsocketClient,
) => {
  const { enableWebsocket, notifier, defaultQueryOptions } = queryConfig;

  const itemWsHooks =
    enableWebsocket && websocketClient // required to type-check non-null
      ? configureWsItemHooks(websocketClient, notifier)
      : undefined;

  return {
    /**
     * Returns items the highest in the tree you have access to
     * Is paginated by default
     * @param params
     * @param pagination
     * @param _options
     * @returns
     */
    useAccessibleItems: (
      params?: ItemSearchParams,
      pagination?: PaginationParams,
      options?: { getUpdates?: boolean },
    ) => {
      const queryClient = useQueryClient();
      const getUpdates = options?.getUpdates ?? enableWebsocket;

      const { data: currentMember } = useCurrentMember();
      itemWsHooks?.useAccessibleItemsUpdates(
        getUpdates ? currentMember?.id : null,
      );

      const debouncedName = useDebounce(params?.name, 500);
      const finalParams = { ...params, name: debouncedName };
      const paginationParams = { ...(pagination ?? {}) };
      return useQuery({
        queryKey: itemKeys.accessiblePage(finalParams, paginationParams),
        queryFn: () =>
          Api.getAccessibleItems(finalParams, paginationParams, queryConfig),
        onSuccess: async ({ data: items }) => {
          // save items in their own key
          // eslint-disable-next-line no-unused-expressions
          items?.forEach(async (item) => {
            const { id } = item;
            queryClient.setQueryData(itemKeys.single(id).content, item);
          });
        },
        onError: (error) => {
          notifier?.({
            type: getAccessibleItemsRoutine.FAILURE,
            payload: { error },
          });
        },
        ...defaultQueryOptions,
      });
    },

    /** @deprecated use useAccessibleItems */
    useOwnItems: (options?: { getUpdates?: boolean }) => {
      const queryClient = useQueryClient();
      const getUpdates = options?.getUpdates ?? enableWebsocket;

      const { data: currentMember } = useCurrentMember();
      itemWsHooks?.useOwnItemsUpdates(getUpdates ? currentMember?.id : null);

      return useQuery({
        queryKey: OWN_ITEMS_KEY,
        queryFn: () => Api.getOwnItems(queryConfig),
        onSuccess: async (items) => {
          // save items in their own key
          // eslint-disable-next-line no-unused-expressions
          items?.forEach(async (item) => {
            const { id } = item;
            queryClient.setQueryData(itemKeys.single(id).content, item);
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
      params?: ItemChildrenParams,
      options?: {
        enabled?: boolean;
        getUpdates?: boolean;
        placeholderData?: PackedItem[];
      },
    ) => {
      const enabled = options?.enabled ?? true;
      const ordered = params?.ordered ?? true;
      const getUpdates = options?.getUpdates ?? enableWebsocket;

      itemWsHooks?.useChildrenUpdates(enabled && getUpdates ? id : null);
      const queryClient = useQueryClient();

      return useQuery({
        queryKey: itemKeys.single(id).children(params?.types),
        queryFn: () => {
          if (!id) {
            throw new UndefinedArgument();
          }
          return Api.getChildren(id, { ...params, ordered }, queryConfig);
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

    useDescendants: ({ id, enabled }: { id?: UUID; enabled?: boolean }) => {
      const queryClient = useQueryClient();
      return useQuery({
        queryKey: itemKeys.single(id).descendants,
        queryFn: () => {
          if (!id) {
            throw new UndefinedArgument();
          }
          return Api.getDescendants({ id }, queryConfig);
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

    /** @deprecated use useAccessibleItems */
    useSharedItems: (options?: { getUpdates?: boolean }) => {
      const getUpdates = options?.getUpdates ?? enableWebsocket;

      const { data: currentMember } = useCurrentMember();
      itemWsHooks?.useSharedItemsUpdates(getUpdates ? currentMember?.id : null);

      const queryClient = useQueryClient();
      return useQuery({
        queryKey: itemKeys.shared(),
        queryFn: () => Api.getSharedItems(queryConfig),
        onSuccess: async (items) => {
          // save items in their own key
          items.forEach(async (item) => {
            const { id } = item;
            queryClient.setQueryData(itemKeys.single(id).content, item);
          });
        },
        ...defaultQueryOptions,
      });
    },

    useItem: (
      id?: UUID,
      options?: {
        getUpdates?: boolean;
        placeholderData?: PackedItem;
      },
    ) => {
      const getUpdates = options?.getUpdates ?? enableWebsocket;
      itemWsHooks?.useItemUpdates(getUpdates ? id : null);

      return useQuery({
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
      });
    },

    // todo: add optimisation to avoid fetching items already in cache
    useItems: (ids: UUID[], options?: { getUpdates?: boolean }) => {
      const getUpdates = options?.getUpdates ?? enableWebsocket;

      itemWsHooks?.useItemsUpdates(getUpdates ? ids : null);

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

    useRecycledItems: (options?: { getUpdates?: boolean }) => {
      const getUpdates = options?.getUpdates ?? enableWebsocket;

      const { data: currentMember } = useCurrentMember();
      itemWsHooks?.useRecycledItemsUpdates(
        getUpdates ? currentMember?.id : null,
      );

      return useQuery({
        queryKey: memberKeys.current().recycledItems,
        queryFn: () =>
          Api.getRecycledItemsData(queryConfig).then((data) =>
            data?.map(({ item }) => item),
          ),
        ...defaultQueryOptions,
      });
    },

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
          queryClient.getQueryData<PackedItem>(itemKeys.single(id).content)
            ?.settings?.hasThumbnail ?? true;
      }
      return useQuery({
        queryKey: itemKeys.single(id).thumbnail({ size, replyUrl: false }),
        queryFn: () => {
          if (!id) {
            throw new UndefinedArgument();
          }
          return Api.downloadItemThumbnail({ id, size }, queryConfig);
        },
        ...defaultQueryOptions,
        enabled: Boolean(id) && shouldFetch,
        staleTime: CONSTANT_KEY_STALE_TIME_MILLISECONDS,
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
          queryClient.getQueryData<PackedItem>(itemKeys.single(id).content)
            ?.settings?.hasThumbnail ?? true;
      }
      return useQuery({
        queryKey: itemKeys.single(id).thumbnail({ size, replyUrl: true }),
        queryFn: () => {
          if (!id) {
            throw new UndefinedArgument();
          }
          return Api.downloadItemThumbnailUrl({ id, size }, queryConfig);
        },
        ...defaultQueryOptions,
        enabled: Boolean(id) && shouldFetch,
        staleTime: CONSTANT_KEY_STALE_TIME_MILLISECONDS,
      });
    },

    useItemFeedbackUpdates: itemWsHooks?.useItemFeedbackUpdates,
  };
};

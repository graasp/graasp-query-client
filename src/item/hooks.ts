import {
  MAX_TARGETS_FOR_READ_REQUEST,
  PackedItem,
  UUID,
  WebsocketClient,
} from '@graasp/sdk';

import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { splitRequestByIdsAndReturn } from '../api/axios.js';
import {
  CONSTANT_KEY_STALE_TIME_MILLISECONDS,
  PAGINATED_ITEMS_PER_PAGE,
} from '../config/constants.js';
import { UndefinedArgument } from '../config/errors.js';
import useDebounce from '../hooks/useDebounce.js';
import { itemKeys } from '../keys.js';
import { QueryClientConfig } from '../types.js';
import { paginate } from '../utils/util.js';
import { configureWsItemHooks } from '../ws/index.js';
import {
  useAccessibleItems,
  useInfiniteAccessibleItems,
} from './accessible/hooks.js';
import * as Api from './api.js';
import { useDescendants } from './descendants/hooks.js';
import { useItemThumbnailUrl } from './thumbnail/hooks.js';
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

      return useInfiniteQuery({
        queryKey: itemKeys.single(id).paginatedChildren,
        queryFn: ({ pageParam = 1 }) =>
          paginate(
            children,
            options?.itemsPerPage || PAGINATED_ITEMS_PER_PAGE,
            pageParam,
            options?.filterFunction,
          ),
        getNextPageParam: (lastPage) => {
          const { pageNumber } = lastPage;
          if (pageNumber !== -1) {
            return pageNumber + 1;
          }
          return undefined;
        },
        initialPageParam: 1,
        enabled,
        ...childrenPaginatedOptions,
      });
    },

    /**
     * return parents for given item id
     * @param id {string} item id
     * @returns immutable list of parent items
     */
    useParents: ({ id, enabled }: { id?: UUID; enabled?: boolean }) => {
      return useQuery({
        queryKey: itemKeys.single(id).parents,
        queryFn: async () => {
          if (!id) {
            throw new UndefinedArgument();
          }

          return Api.getParents({ id }, queryConfig);
        },
        ...defaultQueryOptions,
        enabled: enabled && Boolean(id),
      });
    },

    useDescendants: useDescendants(queryConfig),

    useItem: (id?: UUID) =>
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
      }),

    useItems: (ids: UUID[]) => {
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
        enabled: ids && Boolean(ids.length) && ids.every((id) => Boolean(id)),
        ...defaultQueryOptions,
      });
    },

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

    useItemFeedbackUpdates: itemWsHooks?.useItemFeedbackUpdates,

    useItemThumbnailUrl: useItemThumbnailUrl(queryConfig),
  };
};

export default config;

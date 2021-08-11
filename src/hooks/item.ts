import { QueryClient, useQuery } from 'react-query';
import { List, Map } from 'immutable';
import {
  buildItemChildrenKey,
  buildItemKey,
  buildItemsKey,
  buildItemLoginKey,
  buildItemMembershipsKey,
  buildItemParentsKey,
  buildFileContentKey,
  buildS3FileContentKey,
  OWN_ITEMS_KEY,
  SHARED_ITEMS_KEY, buildGroupItemsOwnKey, buildGroupItemsSharedKey,
} from '../config/keys';
import * as Api from '../api';
import { Item, QueryClientConfig, UndefinedArgument, UUID } from '../types';

export default (queryClient: QueryClient, queryConfig: QueryClientConfig) => {
  const { retry, cacheTime, staleTime } = queryConfig;
  const defaultOptions = {
    retry,
    cacheTime,
    staleTime,
  };

  return {
    useOwnItems: (groupId: string) =>
      useQuery({
        queryKey:
        groupId?
          buildGroupItemsOwnKey(groupId):
        OWN_ITEMS_KEY,
        queryFn: () =>
          groupId?
            Api.getGroupOwnItems(groupId,queryConfig).then((data)=> List(data)) :
            Api.getOwnItems(queryConfig).then((data) => List(data)),
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

    useChildren: (
      id: UUID | undefined,
      options: { enabled?: boolean; ordered?: boolean } = {
        enabled: true,
        ordered: true,
      },
    ) =>
      useQuery({
        queryKey: buildItemChildrenKey(id),
        queryFn: () => {
          if (!id) {
            throw new UndefinedArgument();
          }
          return Api.getChildren(
            id,
            options?.ordered,
            queryConfig,
          ).then((data) => List(data));
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
        enabled: Boolean(id) && options?.enabled,
      }),

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

    useSharedItems: (groupId: string) =>
      useQuery({
        queryKey: groupId?
          buildGroupItemsSharedKey(groupId):
          SHARED_ITEMS_KEY,
        queryFn: () =>
          groupId?
            Api.getSharedGroupItems(groupId,queryConfig).then((data)=> List(data))
            :
            Api.getSharedItems(queryConfig).then((data) => List(data)),
        onSuccess: async (items: List<Item>) => {
          // save items in their own key
          items.forEach(async (item) => {
            const { id } = item;
            queryClient.setQueryData(buildItemKey(id), Map(item));
          });
        },
        ...defaultOptions,
      }),

    useItem: (id?: UUID) =>
      useQuery({
        queryKey: buildItemKey(id),
        queryFn: () => {
          if (!id) {
            throw new UndefinedArgument();
          }
          return Api.getItem(id, queryConfig).then((data) => Map(data));
        },
        enabled: Boolean(id),
        ...defaultOptions,
      }),

    // todo: add optimisation to avoid fetching items already in cache
    useItems: (ids: UUID[]) =>
      useQuery({
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
      }),

    useItemMemberships: (id?: UUID) =>
      useQuery({
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
      }),

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

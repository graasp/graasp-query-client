import { QueryClient, useQuery } from 'react-query';
import { List, Map } from 'immutable';
import {
  buildItemChildrenKey,
  buildItemKey,
  buildItemLoginKey,
  buildItemMembershipsKey,
  buildItemParentsKey,
  OWN_ITEMS_KEY,
  SHARED_ITEMS_KEY,
} from '../config/keys';
import * as Api from '../api';
import { Item, QueryClientConfig, UUID } from '../types';

export default (queryClient: QueryClient, queryConfig: QueryClientConfig) => ({
  useOwnItems: () =>
    useQuery({
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
    }),

  useChildren: (id: UUID, options: { enabled: boolean }) =>
    useQuery({
      queryKey: buildItemChildrenKey(id),
      queryFn: () =>
        Api.getChildren(id, queryConfig).then((data) => List(data)),
      onSuccess: async (items: List<Item>) => {
        if (items?.size) {
          // save items in their own key
          items.forEach(async (item) => {
            const { id: itemId } = item;
            queryClient.setQueryData(buildItemKey(itemId), Map(item));
          });
        }
      },
      enabled: Boolean(id) && options?.enabled,
    }),

  useParents: ({
    id,
    path,
    enabled,
  }: {
    id: UUID;
    path: string;
    enabled: boolean;
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
      enabled: enabled && Boolean(id),
    }),

  useSharedItems: () =>
    useQuery({
      queryKey: SHARED_ITEMS_KEY,
      queryFn: () => Api.getSharedItems(queryConfig).then((data) => List(data)),
      onSuccess: async (items: List<Item>) => {
        // save items in their own key
        items.forEach(async (item) => {
          const { id } = item;
          queryClient.setQueryData(buildItemKey(id), Map(item));
        });
      },
    }),

  useItem: (id: UUID) =>
    useQuery({
      queryKey: buildItemKey(id),
      queryFn: () => Api.getItem(id, queryConfig).then((data) => Map(data)),
      enabled: Boolean(id),
    }),

  useItemMemberships: (id: UUID) =>
    useQuery({
      queryKey: buildItemMembershipsKey(id),
      queryFn: () =>
        Api.getMembershipsForItem(id, queryConfig).then((data) => List(data)),
      enabled: Boolean(id),
    }),

  useItemLogin: (id: UUID) =>
    useQuery({
      queryKey: buildItemLoginKey(id),
      queryFn: () =>
        Api.getItemLogin(id, queryConfig).then((data) => Map(data)),
      enabled: Boolean(id),
    }),
});

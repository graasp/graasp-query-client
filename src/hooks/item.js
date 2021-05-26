import { useQuery } from 'react-query';
import { Map } from 'immutable';
import { buildItemKey } from '../config/keys';
import {
  buildChildren,
  buildGetItem,
  buildItemLoginQuery,
  buildItemMembershipsQuery,
  buildOwnItems,
  buildParents,
  buildSharedItems,
} from './utils';

export default (queryClient, queryConfig) => ({
  useOwnItems: () =>
    useQuery({
      ...buildOwnItems(queryConfig),
      onSuccess: async (items) => {
        // save items in their own key
        // eslint-disable-next-line no-unused-expressions
        items?.forEach(async (item) => {
          const { id } = item;
          queryClient.setQueryData(buildItemKey(id), Map(item));
        });
      },
    }),

  useChildren: (itemId) =>
    useQuery({
      ...buildChildren(itemId, queryConfig),
      onSuccess: async (items) => {
        if (items?.size) {
          // save items in their own key
          items.forEach(async (item) => {
            const { id } = item;
            queryClient.setQueryData(buildItemKey(id), Map(item));
          });
        }
      },
      enabled: Boolean(itemId),
    }),

  useParents: ({ id, path, enabled }) =>
    useQuery({
      ...buildParents({ id, path }, queryConfig),
      onSuccess: async (items) => {
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
      ...buildSharedItems(queryConfig),
      onSuccess: async (items) => {
        // save items in their own key
        items.forEach(async (item) => {
          const { id } = item;
          queryClient.setQueryData(buildItemKey(id), Map(item));
        });
      },
    }),

  useItem: (id) =>
    useQuery({ ...buildGetItem(id, queryConfig), enabled: Boolean(id) }),

  useItemMemberships: (id) =>
    useQuery({
      ...buildItemMembershipsQuery(id, queryConfig),
      enabled: Boolean(id),
    }),

  useItemLogin: (id) =>
    useQuery({
      ...buildItemLoginQuery(id, queryConfig),
      enabled: Boolean(id),
    }),
});

/**
 * Graasp websocket client
 * React effect hooks to subscribe to real-time updates and mutate query client
 */

import { List, Record } from 'immutable';
import { useEffect } from 'react';
import { QueryClient } from 'react-query';
import {
  buildItemChildrenKey,
  buildItemKey,
  OWN_ITEMS_KEY,
  SHARED_ITEMS_KEY,
} from '../../config/keys';
import { Item, UUID } from '../../types';
import { Channel, GraaspWebsocketClient } from '../ws-client';

// TODO: use graasp-types?
interface ItemEvent {
  kind: string;
  op: string;
  item: Item;
}

export default (
  websocketClient: GraaspWebsocketClient,
  queryClient: QueryClient,
) => ({
  /**
   * React hook to subscribe to the updates of the given item ID
   * @param itemId The ID of the item of which to observe updates
   */
  useItemUpdates: (itemId: UUID) => {
    useEffect(() => {
      if (!itemId) {
        return;
      }

      const channel: Channel = { name: itemId, topic: 'item' };
      const itemKey = buildItemKey(itemId);

      const handler = (event: ItemEvent) => {
        if (event.kind === 'self') {
          const current: Record<Item> | undefined = queryClient.getQueryData(
            itemKey,
          );
          const item = event.item;

          if (current?.get('id') === item.id) {
            switch (event.op) {
              case 'update': {
                queryClient.setQueryData(itemKey, item);
                break;
              }
              case 'delete': {
                queryClient.setQueryData(itemKey, null);
                break;
              }
            }
          }
        }
      };

      websocketClient.subscribe(channel, handler);

      return function cleanup() {
        websocketClient.unsubscribe(channel, handler);
      };
    }, [itemId]);
  },

  /**
   * React hook to subscribe to the children updates of the given parent item ID
   * @param parentId The ID of the parent on which to observe children updates
   */
  useChildrenUpdates: (parentId: UUID) => {
    useEffect(() => {
      if (!parentId) {
        return;
      }

      const channel: Channel = { name: parentId, topic: 'item' };
      const parentChildrenKey = buildItemChildrenKey(parentId);

      const handler = (event: ItemEvent) => {
        if (event.kind === 'child') {
          const current: List<Item> | undefined = queryClient.getQueryData(
            parentChildrenKey,
          );

          if (current) {
            const item = event.item;
            let mutation;

            switch (event.op) {
              case 'create': {
                if (!current.find((i) => i.id === item.id)) {
                  mutation = current.push(item);
                  queryClient.setQueryData(parentChildrenKey, mutation);
                  queryClient.setQueryData(buildItemKey(item.id), item);
                }
                break;
              }
              case 'update': {
                // replace value if it exists
                mutation = current.map((i) => (i.id === item.id ? item : i));
                queryClient.setQueryData(parentChildrenKey, mutation);
                queryClient.setQueryData(buildItemKey(item.id), item);

                break;
              }
              case 'delete': {
                mutation = current.filter((i) => i.id !== item.id);
                queryClient.setQueryData(parentChildrenKey, mutation);
                break;
              }
            }
          }
        }
      };

      websocketClient.subscribe(channel, handler);

      return function cleanup() {
        websocketClient.unsubscribe(channel, handler);
      };
    }, [parentId]);
  },

  /**
   * React hook to subscribe to the owned items updates of the given user ID
   * @param userId The ID of the user on which to observe owned items updates
   */
  useOwnItemsUpdates: (userId: UUID) => {
    useEffect(() => {
      if (!userId) {
        return;
      }

      const channel: Channel = { name: userId, topic: 'item/member' };

      const handler = (event: ItemEvent) => {
        if (event.kind === 'own') {
          const current: List<Item> | undefined = queryClient.getQueryData(
            OWN_ITEMS_KEY,
          );

          if (current) {
            const item = event.item;
            let mutation;

            switch (event.op) {
              case 'create': {
                if (!current.find((i) => i.id === item.id)) {
                  mutation = current.push(item);
                  queryClient.setQueryData(OWN_ITEMS_KEY, mutation);
                  queryClient.setQueryData(buildItemKey(item.id), item);
                }
                break;
              }
              case 'update': {
                // replace value if it exists
                mutation = current.map((i) => (i.id === item.id ? item : i));
                queryClient.setQueryData(OWN_ITEMS_KEY, mutation);
                queryClient.setQueryData(buildItemKey(item.id), item);

                break;
              }
              case 'delete': {
                mutation = current.filter((i) => i.id !== item.id);
                queryClient.setQueryData(OWN_ITEMS_KEY, mutation);

                break;
              }
            }
          }
        }
      };

      websocketClient.subscribe(channel, handler);

      return function cleanup() {
        websocketClient.unsubscribe(channel, handler);
      };
    }, [userId]);
  },

  /**
   * React hook to subscribe to the shared items updates of the given user ID
   * @param parentId The ID of the user on which to observe shared items updates
   */
  useSharedItemsUpdates: (userId: UUID) => {
    useEffect(() => {
      if (!userId) {
        return;
      }

      const channel: Channel = { name: userId, topic: 'item/member' };

      const handler = (event: ItemEvent) => {
        if (event.kind === 'shared') {
          const current: List<Item> | undefined = queryClient.getQueryData(
            SHARED_ITEMS_KEY,
          );

          if (current) {
            const item = event.item;
            let mutation;

            switch (event.op) {
              case 'create': {
                if (!current.find((i) => i.id === item.id)) {
                  mutation = current.push(item);
                  queryClient.setQueryData(SHARED_ITEMS_KEY, mutation);
                  queryClient.setQueryData(buildItemKey(item.id), item);
                }
                break;
              }
              case 'update': {
                // replace value if it exists
                mutation = current.map((i) => (i.id === item.id ? item : i));
                queryClient.setQueryData(SHARED_ITEMS_KEY, mutation);
                queryClient.setQueryData(buildItemKey(item.id), item);

                break;
              }
              case 'delete': {
                mutation = current.filter((i) => i.id !== item.id);
                queryClient.setQueryData(SHARED_ITEMS_KEY, mutation);

                break;
              }
            }
          }
        }
      };

      websocketClient.subscribe(channel, handler);

      return function cleanup() {
        websocketClient.unsubscribe(channel, handler);
      };
    }, [userId]);
  },
});

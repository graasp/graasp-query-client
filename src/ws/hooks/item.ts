/**
 * Graasp websocket client
 * React effect hooks to subscribe to real-time updates and mutate query client
 */

import { List, Map, Record } from 'immutable';
import { useEffect } from 'react';
import { QueryClient } from 'react-query';
import {
  buildItemChildrenKey,
  buildItemKey,
  OWN_ITEMS_KEY,
  SHARED_ITEMS_KEY,
} from '../../config/keys';
import { Item, UUID } from '../../types';
import { TOPICS, OPS, KINDS } from '../constants';
import { Channel, WebsocketClient } from '../ws-client';

// TODO: use graasp-types?
interface ItemEvent {
  kind: string;
  op: string;
  item: Item;
}

// eslint-disable-next-line import/prefer-default-export
export const configureWsItemHooks = (
  queryClient: QueryClient,
  websocketClient: WebsocketClient,
) => ({
  /**
   * React hook to subscribe to the updates of the given item ID
   * @param itemId The ID of the item of which to observe updates
   */
  useItemUpdates: (itemId?: UUID | null) => {
    useEffect(() => {
      if (!itemId) {
        return;
      }

      const channel: Channel = { name: itemId, topic: TOPICS.ITEM };
      const itemKey = buildItemKey(itemId);

      const handler = (event: ItemEvent) => {
        if (event.kind === KINDS.SELF) {
          const current: Record<Item> | undefined = queryClient.getQueryData(
            itemKey,
          );
          const item = event.item;

          if (current?.get('id') === item.id) {
            switch (event.op) {
              case OPS.UPDATE: {
                queryClient.setQueryData(itemKey, Map(item));
                break;
              }
              case OPS.DELETE: {
                queryClient.setQueryData(itemKey, null);
                break;
              }
              default:
                console.error('unhandled event for useItemUpdates');
                break;
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
   * React hook to subscribe to the updates of the given item ID
   * @param itemId The ID of the item of which to observe updates
   */
  useItemsUpdates: (itemIds?: UUID[] | null) => {
    useEffect(() => {
      if (!itemIds?.length) {
        return;
      }

      const unsubscribeFunctions = itemIds.map((itemId) => {
        const channel: Channel = { name: itemId, topic: TOPICS.ITEM };
        const itemKey = buildItemKey(itemId);

        const handler = (event: ItemEvent) => {
          if (event.kind === KINDS.SELF) {
            const current: Record<Item> | undefined = queryClient.getQueryData(
              itemKey,
            );
            const item = event.item;

            if (current?.get('id') === item.id) {
              switch (event.op) {
                case OPS.UPDATE: {
                  queryClient.setQueryData(itemKey, Map(item));
                  break;
                }
                case OPS.DELETE: {
                  queryClient.setQueryData(itemKey, null);
                  break;
                }
                default:
                  console.error('unhandled event for useItemUpdates');
                  break;
              }
            }
          }
        };

        websocketClient.subscribe(channel, handler);

        return function cleanup() {
          websocketClient.unsubscribe(channel, handler);
        };
      });

      // eslint-disable-next-line consistent-return
      return () => {
        unsubscribeFunctions.forEach((f) => f());
      };
    }, [itemIds]);
  },

  /**
   * React hook to subscribe to the children updates of the given parent item ID
   * @param parentId The ID of the parent on which to observe children updates
   */
  useChildrenUpdates: (parentId?: UUID | null) => {
    useEffect(() => {
      if (!parentId) {
        return;
      }

      const channel: Channel = { name: parentId, topic: TOPICS.ITEM };
      const parentChildrenKey = buildItemChildrenKey(parentId);

      const handler = (event: ItemEvent) => {
        if (event.kind === KINDS.CHILD) {
          const current = queryClient.getQueryData<List<Item>>(
            parentChildrenKey,
          );

          if (current) {
            const item = event.item;
            let mutation;

            switch (event.op) {
              case OPS.CREATE: {
                if (!current.find((i) => i.id === item.id)) {
                  mutation = current.push(item);
                  queryClient.setQueryData(parentChildrenKey, mutation);
                  queryClient.setQueryData(buildItemKey(item.id), Map(item));
                }
                break;
              }
              case OPS.UPDATE: {
                // replace value if it exists
                mutation = current.map((i) => (i.id === item.id ? item : i));
                queryClient.setQueryData(parentChildrenKey, mutation);
                queryClient.setQueryData(buildItemKey(item.id), Map(item));

                break;
              }
              case OPS.DELETE: {
                mutation = current.filter((i) => i.id !== item.id);
                queryClient.setQueryData(parentChildrenKey, mutation);
                // question: reset item key
                break;
              }
              default:
                console.error('unhandled event for useChildrenUpdates');
                break;
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
  useOwnItemsUpdates: (userId?: UUID | null) => {
    useEffect(() => {
      if (!userId) {
        return;
      }

      const channel: Channel = { name: userId, topic: TOPICS.ITEM_MEMBER };

      const handler = (event: ItemEvent) => {
        if (event.kind === KINDS.OWN) {
          const current = queryClient.getQueryData<List<Item>>(OWN_ITEMS_KEY);

          if (current) {
            const item = event.item;
            let mutation;

            switch (event.op) {
              case OPS.CREATE: {
                if (!current.find((i) => i.id === item.id)) {
                  mutation = current.push(item);
                  queryClient.setQueryData(OWN_ITEMS_KEY, mutation);
                  queryClient.setQueryData(buildItemKey(item.id), Map(item));
                }
                break;
              }
              case OPS.UPDATE: {
                // replace value if it exists
                mutation = current.map((i) => (i.id === item.id ? item : i));
                queryClient.setQueryData(OWN_ITEMS_KEY, mutation);
                queryClient.setQueryData(buildItemKey(item.id), Map(item));

                break;
              }
              case OPS.DELETE: {
                mutation = current.filter((i) => i.id !== item.id);
                queryClient.setQueryData(OWN_ITEMS_KEY, mutation);

                break;
              }
              default:
                console.error('unhandled event for useOwnItemsUpdates');
                break;
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
  useSharedItemsUpdates: (userId?: UUID | null) => {
    useEffect(() => {
      if (!userId) {
        return;
      }

      const channel: Channel = { name: userId, topic: TOPICS.ITEM_MEMBER };

      const handler = (event: ItemEvent) => {
        if (event.kind === KINDS.SHARED) {
          const current: List<Item> | undefined = queryClient.getQueryData(
            SHARED_ITEMS_KEY,
          );

          if (current) {
            const item = event.item;
            let mutation;

            switch (event.op) {
              case OPS.CREATE: {
                if (!current.find((i) => i.id === item.id)) {
                  mutation = current.push(item);
                  queryClient.setQueryData(SHARED_ITEMS_KEY, mutation);
                  queryClient.setQueryData(buildItemKey(item.id), Map(item));
                }
                break;
              }
              case OPS.UPDATE: {
                // replace value if it exists
                mutation = current.map((i) => (i.id === item.id ? item : i));
                queryClient.setQueryData(SHARED_ITEMS_KEY, mutation);
                queryClient.setQueryData(buildItemKey(item.id), Map(item));

                break;
              }
              case OPS.DELETE: {
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

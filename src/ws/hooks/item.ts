/**
 * Graasp websocket client
 * React effect hooks to subscribe to real-time updates and mutate query client
 */
import { List } from 'immutable';
import { useEffect } from 'react';
import { useQueryClient } from 'react-query';

import { UUID, convertJs } from '@graasp/sdk';
import { ItemRecord } from '@graasp/sdk/frontend';

import {
  OWN_ITEMS_KEY,
  SHARED_ITEMS_KEY,
  buildItemChildrenKey,
  buildItemKey,
} from '../../config/keys';
import { KINDS, OPS, TOPICS } from '../constants';
import { Channel, WebsocketClient } from '../ws-client';

// TODO: use graasp-types?
interface ItemEvent {
  kind: string;
  op: string;
  item: any;
}

// eslint-disable-next-line import/prefer-default-export
export const configureWsItemHooks = (websocketClient: WebsocketClient) => ({
  /**
   * React hook to subscribe to the updates of the given item ID
   * @param itemId The ID of the item of which to observe updates
   */
  useItemUpdates: (itemId?: UUID | null) => {
    const queryClient = useQueryClient();
    useEffect(() => {
      if (!itemId) {
        return () => {
          // do nothing
        };
      }

      const channel: Channel = { name: itemId, topic: TOPICS.ITEM };
      const itemKey = buildItemKey(itemId);

      const handler = (event: ItemEvent) => {
        if (event.kind === KINDS.SELF) {
          const current: ItemRecord | undefined =
            queryClient.getQueryData(itemKey);
          const item: ItemRecord = convertJs(event.item);

          if (current?.id === item.id) {
            switch (event.op) {
              case OPS.UPDATE: {
                queryClient.setQueryData(itemKey, item);
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
    const queryClient = useQueryClient();
    useEffect(() => {
      if (!itemIds?.length) {
        return;
      }

      const unsubscribeFunctions = itemIds.map((itemId) => {
        const channel: Channel = { name: itemId, topic: TOPICS.ITEM };
        const itemKey = buildItemKey(itemId);

        const handler = (event: ItemEvent) => {
          if (event.kind === KINDS.SELF) {
            const current: ItemRecord | undefined =
              queryClient.getQueryData(itemKey);
            const item: ItemRecord = convertJs(event.item);

            if (current?.id === item.id) {
              switch (event.op) {
                case OPS.UPDATE: {
                  queryClient.setQueryData(itemKey, item);
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
    const queryClient = useQueryClient();
    useEffect(() => {
      if (!parentId) {
        return () => {
          // do nothing
        };
      }

      const channel: Channel = { name: parentId, topic: TOPICS.ITEM };
      const parentChildrenKey = buildItemChildrenKey(parentId);

      const handler = (event: ItemEvent) => {
        if (event.kind === KINDS.CHILD) {
          const current =
            queryClient.getQueryData<List<ItemRecord>>(parentChildrenKey);

          if (current) {
            const item: ItemRecord = convertJs(event.item);
            let mutation;

            switch (event.op) {
              case OPS.CREATE: {
                if (!current.find((i) => i.id === item.id)) {
                  mutation = current.push(item);
                  queryClient.setQueryData(parentChildrenKey, mutation);
                  queryClient.setQueryData(buildItemKey(item.id), item);
                }
                break;
              }
              case OPS.UPDATE: {
                // replace value if it exists
                mutation = current.map((i) => (i.id === item.id ? item : i));
                queryClient.setQueryData(parentChildrenKey, mutation);
                queryClient.setQueryData(buildItemKey(item.id), item);

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
    const queryClient = useQueryClient();
    useEffect(() => {
      if (!userId) {
        return () => {
          // do nothing
        };
      }

      const channel: Channel = { name: userId, topic: TOPICS.ITEM_MEMBER };

      const handler = (event: ItemEvent) => {
        if (event.kind === KINDS.OWN) {
          const current =
            queryClient.getQueryData<List<ItemRecord>>(OWN_ITEMS_KEY);

          if (current) {
            const item: ItemRecord = convertJs(event.item);
            let mutation;

            switch (event.op) {
              case OPS.CREATE: {
                if (!current.find((i) => i.id === item.id)) {
                  mutation = current.push(item);
                  queryClient.setQueryData(OWN_ITEMS_KEY, mutation);
                  queryClient.setQueryData(buildItemKey(item.id), item);
                }
                break;
              }
              case OPS.UPDATE: {
                // replace value if it exists
                mutation = current.map((i) => (i.id === item.id ? item : i));
                queryClient.setQueryData(OWN_ITEMS_KEY, mutation);
                queryClient.setQueryData(buildItemKey(item.id), item);

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
    const queryClient = useQueryClient();
    useEffect(() => {
      if (!userId) {
        return () => {
          // do nothing
        };
      }

      const channel: Channel = { name: userId, topic: TOPICS.ITEM_MEMBER };

      const handler = (event: ItemEvent) => {
        if (event.kind === KINDS.SHARED) {
          const current: List<ItemRecord> | undefined =
            queryClient.getQueryData(SHARED_ITEMS_KEY);

          if (current) {
            const item: ItemRecord = convertJs(event.item);
            let mutation;

            switch (event.op) {
              case OPS.CREATE: {
                if (!current.find((i) => i.id === item.id)) {
                  mutation = current.push(item);
                  queryClient.setQueryData(SHARED_ITEMS_KEY, mutation);
                  queryClient.setQueryData(buildItemKey(item.id), item);
                }
                break;
              }
              case OPS.UPDATE: {
                // replace value if it exists
                mutation = current.map((i) => (i.id === item.id ? item : i));
                queryClient.setQueryData(SHARED_ITEMS_KEY, mutation);
                queryClient.setQueryData(buildItemKey(item.id), item);

                break;
              }
              case OPS.DELETE: {
                mutation = current.filter((i) => i.id !== item.id);
                queryClient.setQueryData(SHARED_ITEMS_KEY, mutation);

                break;
              }
              default:
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
});

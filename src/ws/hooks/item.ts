/**
 * Graasp websocket client
 * React effect hooks to subscribe to real-time updates and mutate query client
 */
import {
  DiscriminatedItem,
  Item,
  ResultOf,
  UUID,
  convertJs,
  parseStringToDate,
} from '@graasp/sdk';
import { Channel, ItemRecord, WebsocketClient } from '@graasp/sdk/frontend';

import { List } from 'immutable';
import { useEffect } from 'react';
import { useQueryClient } from 'react-query';

import {
  OWN_ITEMS_KEY,
  RECYCLED_ITEMS_KEY,
  SHARED_ITEMS_KEY,
  buildItemChildrenKey,
  buildItemKey,
} from '../../config/keys';
import {
  copyItemRoutine,
  deleteItemRoutine,
  editItemRoutine,
  exportItemRoutine,
  moveItemRoutine,
  postItemValidationRoutine,
  recycleItemsRoutine,
  restoreItemsRoutine,
} from '../../routines';
import createRoutine from '../../routines/utils';
import { Notifier } from '../../types';
import { KINDS, OPS, TOPICS } from '../constants';

interface ItemEvent {
  kind: string;
  op: string;
  item: DiscriminatedItem;
}

interface ItemOpFeedbackEvent {
  kind: 'feedback';
  op:
    | 'update'
    | 'delete'
    | 'move'
    | 'copy'
    | 'export'
    | 'recycle'
    | 'restore'
    | 'validate';
  resource: Item['id'][];
  result:
    | {
        error: Error;
      }
    | ResultOf<Item>;
}

// eslint-disable-next-line import/prefer-default-export
export const configureWsItemHooks = (
  websocketClient: WebsocketClient,
  notifier?: Notifier,
) => ({
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
          const item: ItemRecord = convertJs(parseStringToDate(event.item));

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
            const item: ItemRecord = convertJs(parseStringToDate(event.item));

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
            const item: ItemRecord = convertJs(parseStringToDate(event.item));
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
            const item: ItemRecord = convertJs(parseStringToDate(event.item));
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
            const item: ItemRecord = convertJs(parseStringToDate(event.item));
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

  useRecycledItemsUpdates: (userId?: UUID | null) => {
    const queryClient = useQueryClient();
    useEffect(() => {
      if (!userId) {
        return () => {
          // do nothing
        };
      }

      const channel: Channel = { name: userId, topic: TOPICS.ITEM_MEMBER };

      const handler = (event: ItemEvent) => {
        if (event.kind === KINDS.RECYCLEBIN) {
          const current =
            queryClient.getQueryData<List<ItemRecord>>(RECYCLED_ITEMS_KEY);

          if (current) {
            const item: ItemRecord = convertJs(parseStringToDate(event.item));
            let mutation;

            switch (event.op) {
              case OPS.CREATE: {
                if (!current.find((i) => i.id === item.id)) {
                  mutation = current.push(item);
                  queryClient.setQueryData(RECYCLED_ITEMS_KEY, mutation);
                  queryClient.setQueryData(buildItemKey(item.id), item);
                }
                break;
              }
              case OPS.DELETE: {
                mutation = current.filter((i) => i.id !== item.id);
                queryClient.setQueryData(RECYCLED_ITEMS_KEY, mutation);
                break;
              }
              default:
                console.error('unhandled event for useRecyledItemsUpdates');
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
   * React hook to subscribe to the feedback of async operations performed by the given user ID
   * @param userId The ID of the user on which to observe item feedback updates
   */
  useItemFeedbackUpdates: (userId?: UUID | null) => {
    const queryClient = useQueryClient();
    useEffect(() => {
      if (!userId) {
        return () => {
          // do nothing
        };
      }

      const channel: Channel = { name: userId, topic: TOPICS.ITEM_MEMBER };

      const handler = (event: ItemOpFeedbackEvent) => {
        if (event.kind === KINDS.FEEDBACK) {
          const current =
            queryClient.getQueryData<List<ItemRecord>>(OWN_ITEMS_KEY);

          if (current) {
            let routine: ReturnType<typeof createRoutine> | undefined;
            switch (event.op) {
              case 'update':
                routine = editItemRoutine;
                break;
              case 'delete':
                routine = deleteItemRoutine;
                break;
              case 'move':
                routine = moveItemRoutine;
                break;
              case 'copy':
                routine = copyItemRoutine;
                break;
              case 'export':
                routine = exportItemRoutine;
                break;
              case 'recycle':
                routine = recycleItemsRoutine;
                break;
              case 'restore':
                routine = restoreItemsRoutine;
                break;
              case 'validate':
                routine = postItemValidationRoutine;
                break;
              default: {
                console.error('unhandled event for useItemFeedbackUpdates');
                break;
              }
            }
            if (routine) {
              if ('error' in event.result) {
                notifier?.({
                  type: routine.FAILURE,
                });
              } else {
                notifier?.({
                  type: routine.SUCCESS,
                });
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

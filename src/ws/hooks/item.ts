/**
 * Graasp websocket client
 * React effect hooks to subscribe to real-time updates and mutate query client
 */
import {
  Channel,
  DiscriminatedItem,
  ResultOf,
  UUID,
  WebsocketClient,
} from '@graasp/sdk';
import { SUCCESS_MESSAGES } from '@graasp/translations';

import { useEffect } from 'react';
import { useQueryClient } from 'react-query';

import {
  OWN_ITEMS_KEY,
  RECYCLED_ITEMS_KEY,
  SHARED_ITEMS_KEY,
  accessibleItemsKeys,
  buildItemChildrenKeys,
  buildItemKey,
} from '../../config/keys';
import {
  copyItemsRoutine,
  deleteItemsRoutine,
  editItemRoutine,
  exportItemRoutine,
  moveItemsRoutine,
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
  resource: DiscriminatedItem['id'][];
  result:
    | {
        error: Error;
      }
    | ResultOf<DiscriminatedItem>;
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
          const current: DiscriminatedItem | undefined =
            queryClient.getQueryData(itemKey);
          const { item } = event;

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
            const current: DiscriminatedItem | undefined =
              queryClient.getQueryData(itemKey);
            const { item } = event;

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
      const parentChildrenKey = buildItemChildrenKeys(parentId).all;

      const handler = (event: ItemEvent) => {
        if (event.kind === KINDS.CHILD) {
          // const current =
          //   queryClient.getQueryData<DiscriminatedItem[]>(parentChildrenKey);

          // TODO: check if we have to invalidate queries or not
          const { item } = event;
          queryClient.invalidateQueries(parentChildrenKey);
          queryClient.invalidateQueries(buildItemKey(item.id));

          // if (current) {
          //   const { item } = event;
          //   let mutation;

          //   switch (event.op) {
          //     case OPS.CREATE: {
          //       if (!current.find((i) => i.id === item.id)) {
          //         mutation = [...current, item];
          //         queryClient.setQueryData(parentChildrenKey, mutation);
          //         queryClient.setQueryData(buildItemKey(item.id), item);
          //       }
          //       break;
          //     }
          //     case OPS.UPDATE: {
          //       // replace value if it exists
          //       mutation = current.map((i) => (i.id === item.id ? item : i));
          //       queryClient.setQueryData(parentChildrenKey, mutation);
          //       queryClient.setQueryData(buildItemKey(item.id), item);

          //       break;
          //     }
          //     case OPS.DELETE: {
          //       mutation = current.filter((i) => i.id !== item.id);
          //       queryClient.setQueryData(parentChildrenKey, mutation);
          //       // question: reset item key
          //       break;
          //     }
          //     default:
          //       console.error('unhandled event for useChildrenUpdates');
          //       break;
          //   }
          // }
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
            queryClient.getQueryData<DiscriminatedItem[]>(OWN_ITEMS_KEY);

          if (current) {
            const { item } = event;
            let mutation;

            switch (event.op) {
              case OPS.CREATE: {
                if (!current.find((i) => i.id === item.id)) {
                  mutation = [...current, item];
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
          const current: DiscriminatedItem[] | undefined =
            queryClient.getQueryData(SHARED_ITEMS_KEY);

          if (current) {
            const { item } = event;
            let mutation;

            switch (event.op) {
              case OPS.CREATE: {
                if (!current.find((i) => i.id === item.id)) {
                  mutation = [...current, item];
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
  /**
   * React hook to subscribe to the accessible items updates
   */
  useAccessibleItemsUpdates: (userId?: UUID | null) => {
    const queryClient = useQueryClient();
    useEffect(() => {
      if (!userId) {
        return () => {
          // do nothing
        };
      }

      const channel: Channel = { name: userId, topic: TOPICS.ITEM_MEMBER };

      const handlerAccessible = (event: ItemEvent) => {
        if (event.kind === KINDS.ACCESSIBLE) {
          // for over all accessible keys

          // operations might change the result of the search and/or pagination
          // so it's easier to invalidate all queries
          queryClient.invalidateQueries(accessibleItemsKeys.all);

          const { item } = event;
          switch (event.op) {
            case OPS.CREATE: {
              queryClient.setQueryData(buildItemKey(item.id), item);
              break;
            }
            case OPS.UPDATE: {
              queryClient.setQueryData(buildItemKey(item.id), item);
              break;
            }
            case OPS.DELETE: {
              break;
            }
            default:
              console.error('unhandled event for useAccessibleItemsUpdates');
              break;
          }
        }
      };

      websocketClient.subscribe(channel, handlerAccessible);

      return function cleanup() {
        websocketClient.unsubscribe(channel, handlerAccessible);
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
        if (event.kind === KINDS.RECYCLE_BIN) {
          const current =
            queryClient.getQueryData<DiscriminatedItem[]>(RECYCLED_ITEMS_KEY);

          if (current) {
            const { item } = event;

            switch (event.op) {
              case OPS.CREATE: {
                if (!current.find((i) => i.id === item.id)) {
                  const mutation = [...current, item];
                  queryClient.setQueryData(RECYCLED_ITEMS_KEY, mutation);
                }
                break;
              }
              case OPS.DELETE: {
                const mutation = current.filter((i) => i.id !== item.id);
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
    useEffect(() => {
      if (!userId) {
        return () => {
          // do nothing
        };
      }

      const channel: Channel = { name: userId, topic: TOPICS.ITEM_MEMBER };

      const handler = (event: ItemOpFeedbackEvent) => {
        if (event.kind === KINDS.FEEDBACK) {
          let routine: ReturnType<typeof createRoutine> | undefined;
          let message: string | undefined;
          switch (event.op) {
            case 'update':
              routine = editItemRoutine;
              message = SUCCESS_MESSAGES.EDIT_ITEM;
              break;
            case 'delete':
              routine = deleteItemsRoutine;
              message = SUCCESS_MESSAGES.DELETE_ITEMS;
              break;
            case 'move':
              routine = moveItemsRoutine;
              message = SUCCESS_MESSAGES.MOVE_ITEMS;
              break;
            case 'copy':
              routine = copyItemsRoutine;
              message = SUCCESS_MESSAGES.COPY_ITEMS;
              break;
            case 'export':
              routine = exportItemRoutine;
              message = SUCCESS_MESSAGES.DEFAULT_SUCCESS;
              break;
            case 'recycle':
              routine = recycleItemsRoutine;
              message = SUCCESS_MESSAGES.RECYCLE_ITEMS;
              break;
            case 'restore':
              routine = restoreItemsRoutine;
              message = SUCCESS_MESSAGES.RESTORE_ITEMS;
              break;
            case 'validate':
              routine = postItemValidationRoutine;
              message = SUCCESS_MESSAGES.DEFAULT_SUCCESS;
              break;
            default: {
              console.error('unhandled event for useItemFeedbackUpdates');
              break;
            }
          }
          if (routine && message) {
            if ('error' in event.result) {
              notifier?.({
                type: routine.FAILURE,
                payload: {
                  error: event.result.error,
                },
              });
            } else {
              notifier?.({
                type: routine.SUCCESS,
                payload: { message },
              });
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

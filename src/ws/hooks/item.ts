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

import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { OWN_ITEMS_KEY, itemKeys, memberKeys } from '../../config/keys.js';
import { addToChangesKey } from '../../config/utils.js';
import {
  copyItemsRoutine,
  deleteItemsRoutine,
  editItemRoutine,
  exportItemRoutine,
  moveItemsRoutine,
  postItemValidationRoutine,
  recycleItemsRoutine,
  restoreItemsRoutine,
} from '../../routines/index.js';
import createRoutine from '../../routines/utils.js';
import { Notifier } from '../../types.js';
import { KINDS, OPS, TOPICS } from '../constants.js';

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
      const itemKey = itemKeys.single(itemId).content;

      const handler = (event: ItemEvent) => {
        if (event.kind === KINDS.SELF) {
          const current: DiscriminatedItem | undefined =
            queryClient.getQueryData(itemKey);
          const { item } = event;

          if (current?.id === item.id) {
            switch (event.op) {
              case OPS.UPDATE: {
                addToChangesKey(queryClient, itemKey);
                break;
              }
              case OPS.DELETE: {
                // should looks for keys that should be updated or invalidated further.
                // leads to seeing an error message if this item was viewed in the builder for example.
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
   * React hook to subscribe to the updates of the given item IDs
   * @param itemIds The IDs of the items for which to observe updates
   */
  useItemsUpdates: (itemIds?: UUID[] | null) => {
    const queryClient = useQueryClient();
    useEffect(() => {
      if (!itemIds?.length) {
        return;
      }

      const unsubscribeFunctions = itemIds.map((itemId) => {
        const channel: Channel = { name: itemId, topic: TOPICS.ITEM };
        const itemKey = itemKeys.single(itemId).content;

        const handler = (event: ItemEvent) => {
          if (event.kind === KINDS.SELF) {
            const current: DiscriminatedItem | undefined =
              queryClient.getQueryData(itemKey);
            const { item } = event;

            if (current?.id === item.id) {
              switch (event.op) {
                case OPS.UPDATE: {
                  addToChangesKey(queryClient, itemKey);
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
      const parentChildrenKey = itemKeys.single(parentId).children();

      const handler = (event: ItemEvent) => {
        if (event.kind === KINDS.CHILD) {
          const current =
            queryClient.getQueryData<DiscriminatedItem[]>(parentChildrenKey);

          if (current) {
            const { item } = event;

            switch (event.op) {
              case OPS.CREATE: {
                addToChangesKey(queryClient, parentChildrenKey);
                break;
              }
              case OPS.UPDATE: {
                addToChangesKey(queryClient, parentChildrenKey);
                break;
              }
              case OPS.DELETE: {
                queryClient.setQueryData(
                  parentChildrenKey,
                  current.filter((i) => i.id !== item.id),
                );
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
            queryClient.getQueryData<DiscriminatedItem[]>(OWN_ITEMS_KEY);

          if (current) {
            const { item } = event;

            switch (event.op) {
              case OPS.CREATE: {
                addToChangesKey(queryClient, OWN_ITEMS_KEY);
                break;
              }
              case OPS.UPDATE: {
                addToChangesKey(queryClient, OWN_ITEMS_KEY);
                break;
              }
              case OPS.DELETE: {
                queryClient.setQueryData(
                  OWN_ITEMS_KEY,
                  current.filter((i) => i.id !== item.id),
                );
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
            queryClient.getQueryData(itemKeys.shared());

          if (current) {
            const { item } = event;

            switch (event.op) {
              case OPS.CREATE: {
                addToChangesKey(queryClient, itemKeys.shared());
                break;
              }
              case OPS.UPDATE: {
                addToChangesKey(queryClient, itemKeys.shared());
                break;
              }
              case OPS.DELETE: {
                queryClient.setQueryData(
                  itemKeys.shared(),
                  current.filter((i) => i.id !== item.id),
                );
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

          switch (event.op) {
            case OPS.CREATE: {
              // operations might change the result of the search and/or pagination
              // so it's easier to invalidate all queries
              addToChangesKey(queryClient, itemKeys.allAccessible());
              break;
            }
            case OPS.UPDATE: {
              addToChangesKey(queryClient, itemKeys.allAccessible());
              break;
            }
            case OPS.DELETE: {
              // operations might change the result of the search and/or pagination
              // so it's easier to invalidate all queries
              queryClient.invalidateQueries(itemKeys.allAccessible());
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
          const current = queryClient.getQueryData<DiscriminatedItem[]>(
            memberKeys.current().recycledItems,
          );

          if (current) {
            const { item } = event;

            switch (event.op) {
              case OPS.CREATE: {
                addToChangesKey(
                  queryClient,
                  memberKeys.current().recycledItems,
                );
                break;
              }
              case OPS.DELETE: {
                queryClient.setQueryData(
                  memberKeys.current().recycledItems,
                  current.filter((i) => i.id !== item.id),
                );
                break;
              }
              default:
                console.error('unhandled event for useRecycledItemsUpdates');
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
          let routine: ReturnType<typeof createRoutine> | undefined;
          let message: string | undefined;
          const itemIds = event.resource;
          switch (event.op) {
            case OPS.UPDATE:
              routine = editItemRoutine;
              message = SUCCESS_MESSAGES.EDIT_ITEM;
              // todo: add invalidations for queries related to an update of the itemIds specified
              break;
            case OPS.DELETE:
              routine = deleteItemsRoutine;
              message = SUCCESS_MESSAGES.DELETE_ITEMS;
              // invalidate data displayed in the Trash screen
              queryClient.invalidateQueries(memberKeys.current().recycled);
              queryClient.invalidateQueries(memberKeys.current().recycledItems);
              break;
            case OPS.MOVE:
              routine = moveItemsRoutine;
              message = SUCCESS_MESSAGES.MOVE_ITEMS;
              // todo: invalidate queries for the source and destination
              break;
            case OPS.COPY:
              routine = copyItemsRoutine;
              message = SUCCESS_MESSAGES.COPY_ITEMS;
              // todo: invalidate queries for the destination
              break;
            case OPS.EXPORT:
              routine = exportItemRoutine;
              message = SUCCESS_MESSAGES.DEFAULT_SUCCESS;
              break;
            case 'recycle':
              routine = recycleItemsRoutine;
              message = SUCCESS_MESSAGES.RECYCLE_ITEMS;
              // todo: invalidate the queries related to the trash and to the original source

              break;
            case OPS.RESTORE:
              routine = restoreItemsRoutine;
              message = SUCCESS_MESSAGES.RESTORE_ITEMS;
              break;
            case OPS.VALIDATE:
              routine = postItemValidationRoutine;
              message = SUCCESS_MESSAGES.DEFAULT_SUCCESS;
              // todo: invalidate the validation query to refetch the validation status
              itemIds.map((itemId) =>
                queryClient.invalidateQueries(
                  itemKeys.single(itemId).validation,
                ),
              );
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

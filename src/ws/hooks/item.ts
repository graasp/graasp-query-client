/**
 * Graasp websocket client
 * React effect hooks to subscribe to real-time updates and mutate query client
 */
import {
  Channel,
  DiscriminatedItem,
  FeedBackOP,
  FeedBackOPType,
  ItemOpFeedbackEvent as OpFeedbackEvent,
  UUID,
  WebsocketClient,
  getParentFromPath,
  isOperationEvent,
} from '@graasp/sdk';
import { SUCCESS_MESSAGES } from '@graasp/translations';

import { QueryClient, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { getKeyForParentId, itemKeys, memberKeys } from '../../config/keys.js';
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
import { KINDS, TOPICS } from '../constants.js';

/**
 * Events from asynchronous background operations on given items
 */
type ItemOpFeedbackEvent<T extends FeedBackOPType = FeedBackOPType> =
  OpFeedbackEvent<DiscriminatedItem, T>;

const InvalidateItemOpFeedback = (queryClient: QueryClient) => ({
  [FeedBackOP.DELETE]: () => {
    // invalidate data displayed in the Trash screen
    queryClient.invalidateQueries(memberKeys.current().recycled);
    queryClient.invalidateQueries(memberKeys.current().recycledItems);
  },
  [FeedBackOP.MOVE]: (event: ItemOpFeedbackEvent<typeof FeedBackOP.MOVE>) => {
    if (event.result) {
      const { items, moved } = event.result;
      const oldParentKey = getKeyForParentId(getParentFromPath(items[0].path));
      const newParentKey = getKeyForParentId(getParentFromPath(moved[0].path));
      // invalidate queries for the source and destination
      queryClient.invalidateQueries(oldParentKey);
      queryClient.invalidateQueries(newParentKey);
    }
  },
  [FeedBackOP.COPY]: (event: ItemOpFeedbackEvent<typeof FeedBackOP.COPY>) => {
    if (event.result) {
      const { copies } = event.result;

      const newParentKey = getKeyForParentId(getParentFromPath(copies[0].path));
      // invalidate queries for the destination
      queryClient.invalidateQueries(newParentKey);
    }
  },
  [FeedBackOP.RECYCLE]: (
    event: ItemOpFeedbackEvent<typeof FeedBackOP.RECYCLE>,
  ) => {
    if (event.result) {
      const items = event.result;
      const parentKey = getKeyForParentId(
        getParentFromPath(Object.values(items)[0].path),
      );
      // invalidate queries for the parent
      queryClient.invalidateQueries(parentKey);
    }
  },
  [FeedBackOP.RESTORE]: () => {
    queryClient.invalidateQueries(memberKeys.current().recycledItems);
  },
  [FeedBackOP.VALIDATE]: (itemIds: string[]) => {
    // todo: invalidate the validation query to refetch the validation status
    itemIds.map((itemId) =>
      queryClient.invalidateQueries(itemKeys.single(itemId).validation),
    );
  },
});

// eslint-disable-next-line import/prefer-default-export
export const configureWsItemHooks = (
  websocketClient: WebsocketClient,
  notifier?: Notifier,
) => ({
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
          const invalidateFeedback = InvalidateItemOpFeedback(queryClient);
          let routine: ReturnType<typeof createRoutine> | undefined;
          let message: string | undefined;
          const itemIds = event.resource;

          switch (true) {
            // TODO: still used ?
            case isOperationEvent(event, FeedBackOP.UPDATE):
              routine = editItemRoutine;
              message = SUCCESS_MESSAGES.EDIT_ITEM;
              // todo: add invalidations for queries related to an update of the itemIds specified
              break;
            case isOperationEvent(event, FeedBackOP.DELETE):
              routine = deleteItemsRoutine;
              message = SUCCESS_MESSAGES.DELETE_ITEMS;
              invalidateFeedback[event.op]();
              break;
            case isOperationEvent(event, FeedBackOP.MOVE): {
              routine = moveItemsRoutine;
              message = SUCCESS_MESSAGES.MOVE_ITEMS;
              invalidateFeedback[event.op](event);
              break;
            }
            case isOperationEvent(event, FeedBackOP.COPY):
              routine = copyItemsRoutine;
              message = SUCCESS_MESSAGES.COPY_ITEMS;
              invalidateFeedback[event.op](event);
              break;
            case isOperationEvent(event, FeedBackOP.EXPORT):
              routine = exportItemRoutine;
              message = SUCCESS_MESSAGES.DEFAULT_SUCCESS;
              // nothing to invalidate
              break;
            case isOperationEvent(event, FeedBackOP.RECYCLE):
              routine = recycleItemsRoutine;
              message = SUCCESS_MESSAGES.RECYCLE_ITEMS;
              invalidateFeedback[event.op](event);
              break;
            case isOperationEvent(event, FeedBackOP.RESTORE):
              routine = restoreItemsRoutine;
              message = SUCCESS_MESSAGES.RESTORE_ITEMS;
              invalidateFeedback[event.op]();
              break;
            case isOperationEvent(event, FeedBackOP.VALIDATE):
              routine = postItemValidationRoutine;
              message = SUCCESS_MESSAGES.DEFAULT_SUCCESS;
              invalidateFeedback[event.op](itemIds);
              break;
            default: {
              console.error('unhandled event for useItemFeedbackUpdates');
              break;
            }
          }
          if (routine && message) {
            if (event.errors.length > 0) {
              notifier?.({
                type: routine.FAILURE,
                payload: {
                  error: event.errors[0], // TODO: check what to send if multiple errors
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

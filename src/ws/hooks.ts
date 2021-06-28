/**
 * Graasp websocket client
 * React effect hooks to subscribe to real-time updates and mutate query client
 *
 * @author Alexandre CHAU
 */

import { ServerMessage } from 'graasp-websockets/src/interfaces/message';
import { List } from 'immutable';
import { useEffect } from 'react';
import { QueryClient } from 'react-query';
import {
  buildItemChildrenKey,
  buildItemKey,
  SHARED_ITEMS_KEY,
} from '../config/keys';
import { Item, UUID } from '../types';
import { Channel, GraaspWebsocketClient } from './ws-client';

const ITEM_ENTITY_TYPE = 'item';
const MEMBER_ENTITY_TYPE = 'member';

export default (
  websocketClient: GraaspWebsocketClient,
  queryClient: QueryClient,
) => ({
  /**
   * React hook to subscribe to the children updates of the give parent item ID
   *
   * @param parentId The ID of the parent on which to observe children updates
   */
  useChildrenUpdates: (parentId: UUID) => {
    useEffect(() => {
      if (!parentId) {
        return;
      }

      const channel: Channel = { name: parentId, entity: ITEM_ENTITY_TYPE };
      const parentChildrenKey = buildItemChildrenKey(parentId);

      const handler = (data: ServerMessage) => {
        if (
          data.type === 'update' &&
          data.body.kind === 'childItem' &&
          data.body.entity === ITEM_ENTITY_TYPE
        ) {
          const current: List<Item> | undefined = queryClient.getQueryData(
            parentChildrenKey,
          );
          const value = data.body.value;
          let mutation;
          switch (data.body.op) {
            case 'create': {
              if (current && !current.find((i) => i.id === value.id)) {
                mutation = current.push(value);
                queryClient.setQueryData(parentChildrenKey, mutation);
                queryClient.setQueryData(buildItemKey(value.id), value);
              }
              break;
            }
            case 'delete': {
              if (current) {
                mutation = current.filter((i) => i.id !== value.id);
                queryClient.setQueryData(parentChildrenKey, mutation);
              }
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

  useSharedItemsUpdates: (userId: UUID) => {
    useEffect(() => {
      if (!userId) {
        return;
      }

      const channel: Channel = { name: userId, entity: MEMBER_ENTITY_TYPE };

      const handler = (data: ServerMessage) => {
        if (
          data.type === 'update' &&
          data.body.kind === 'sharedWith' &&
          data.body.entity === MEMBER_ENTITY_TYPE
        ) {
          const current: List<Item> | undefined = queryClient.getQueryData(
            SHARED_ITEMS_KEY,
          );
          const value = data.body.value;
          let mutation;
          switch (data.body.op) {
            case 'create': {
              if (current && !current.find((i) => i.id === value.id)) {
                mutation = current.push(value);
                queryClient.setQueryData(SHARED_ITEMS_KEY, mutation);
                queryClient.setQueryData(buildItemKey(value.id), value);
              }
              break;
            }
            case 'delete': {
              if (current) {
                mutation = current.filter((i) => i.id !== value.id);
                queryClient.setQueryData(SHARED_ITEMS_KEY, mutation);
              }
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

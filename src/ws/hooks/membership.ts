import {
  Channel,
  ItemMembership,
  UUID,
  WebsocketClient,
  getIdsFromPath,
} from '@graasp/sdk';

import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { itemKeys } from '../../keys.js';
import { KINDS, OPS, TOPICS } from '../constants.js';

// todo: use graasp-types?
interface MembershipEvent {
  kind: string;
  op: string;
  membership: ItemMembership;
}

export const configureWsMembershipHooks = (
  websocketClient: WebsocketClient,
): { useItemsMembershipsUpdates: (itemIds?: UUID[] | null) => void } => ({
  /**
   * React hooks to subscribe to membership updates for a given item ID
   * @param itemIds The IDs of the items of which to observe memberships updates
   */
  useItemsMembershipsUpdates: (itemIds?: UUID[] | null) => {
    const queryClient = useQueryClient();
    useEffect(() => {
      if (!itemIds?.length) {
        return;
      }

      const unsubscribeFunctions = itemIds.map((itemId) => {
        const channel: Channel = {
          name: itemId,
          topic: TOPICS.MEMBERSHIPS_ITEM,
        };
        const itemMembershipsKey = itemKeys.single(itemId).memberships;

        const handler = (event: MembershipEvent): void => {
          if (event.kind === KINDS.ITEM) {
            const current =
              queryClient.getQueryData<ItemMembership[]>(itemMembershipsKey);
            const { membership } = event;
            // we handle only direct memberships
            // since we have only the item id information
            if (membership.item) {
              const lastId = getIdsFromPath(membership.item.path).pop();
              if (current && lastId === itemId) {
                switch (event.op) {
                  case OPS.CREATE: {
                    if (!current.find((m) => m.id === membership.id)) {
                      const mutation = [...current, membership];
                      queryClient.setQueryData(itemMembershipsKey, mutation);
                    }
                    break;
                  }
                  case OPS.UPDATE: {
                    const mutation = current.map((m) =>
                      m.id === membership.id ? membership : m,
                    );
                    queryClient.setQueryData(itemMembershipsKey, mutation);
                    break;
                  }
                  case OPS.DELETE: {
                    const mutation = current.filter(
                      (m) => m.id !== membership.id,
                    );
                    queryClient.setQueryData(itemMembershipsKey, mutation);
                    break;
                  }
                  default:
                    console.error(
                      'unhandled event for useItemsMembershipsUpdates',
                    );
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
      });

      // todo: handle many memberships key

      return () => {
        unsubscribeFunctions.forEach((f) => {
          f();
        });
      };
    }, [itemIds]);
  },
});

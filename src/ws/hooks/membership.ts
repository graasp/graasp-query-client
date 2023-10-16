import { ItemMembership, UUID, convertJs, getIdsFromPath } from '@graasp/sdk';
import {
  Channel,
  ItemMembershipRecord,
  WebsocketClient,
} from '@graasp/sdk/frontend';

import { List } from 'immutable';
import { useEffect } from 'react';
import { useQueryClient } from 'react-query';

import { buildItemMembershipsKey } from '../../config/keys';
import { KINDS, OPS, TOPICS } from '../constants';

// todo: use graasp-types?
interface MembershipEvent {
  kind: string;
  op: string;
  membership: ItemMembership;
}

// eslint-disable-next-line import/prefer-default-export
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
        const itemMembershipsKey = buildItemMembershipsKey(itemId);

        const handler = (event: MembershipEvent): void => {
          if (event.kind === KINDS.ITEM) {
            const current =
              queryClient.getQueryData<List<ItemMembershipRecord>>(
                itemMembershipsKey,
              );
            const membership: ItemMembershipRecord = convertJs(
              event.membership,
            );
            // we handle only direct memberships
            // since we have only the item id information
            if (membership.item) {
              const lastId = getIdsFromPath(membership.item.path).pop();
              if (current && lastId === itemId) {
                let mutation;
                switch (event.op) {
                  case OPS.CREATE: {
                    if (!current.find((m) => m.id === membership.id)) {
                      mutation = current.push(membership);
                      queryClient.setQueryData(itemMembershipsKey, mutation);
                    }
                    break;
                  }
                  case OPS.UPDATE: {
                    mutation = current.map((m) =>
                      m.id === membership.id ? membership : m,
                    );
                    queryClient.setQueryData(itemMembershipsKey, mutation);
                    break;
                  }
                  case OPS.DELETE: {
                    mutation = current.filter((m) => m.id !== membership.id);
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

      // eslint-disable-next-line consistent-return
      return () => {
        unsubscribeFunctions.forEach((f) => {
          f();
        });
      };
    }, [itemIds]);
  },
});

import { List } from 'immutable';
import { useEffect } from 'react';
import { QueryClient } from 'react-query';
import { buildItemMembershipsKey } from '../../config/keys';
import { Membership, UUID } from '../../types';
import { KINDS, OPS, TOPICS } from '../constants';
import { Channel, WebsocketClient } from '../ws-client';

// todo: use graasp-types?
interface MembershipEvent {
  kind: string;
  op: string;
  membership: Membership;
}

// eslint-disable-next-line import/prefer-default-export
export const configureWsMembershipHooks = (
  queryClient: QueryClient,
  websocketClient: WebsocketClient,
) => ({
  /**
   * React hooks to subscribe to membership updates for a given item ID
   * @param itemId The ID of the item of which to observe memberships updates
   */
  useItemMembershipsUpdates: (itemIds?: UUID[] | null) => {
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

        const handler = (event: MembershipEvent) => {
          if (event.kind === KINDS.ITEM) {
            const current = queryClient.getQueryData<List<Membership>>(
              itemMembershipsKey,
            );
            const membership = event.membership;

            if (current && membership.itemId === itemId) {
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
                    'unhandled event for useItemMembershipsUpdates',
                  );
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
        unsubscribeFunctions.forEach((f) => {
          f();
        });
      };
    }, [itemIds]);
  },
});

import { List } from 'immutable';
import { useEffect } from 'react';
import { QueryClient } from 'react-query';
import { buildItemMembershipsKey } from '../../config/keys';
import { Membership, UUID } from '../../types';
import { Channel, GraaspWebsocketClient } from '../ws-client';

// todo: use graasp-types?
interface MembershipEvent {
  kind: string;
  op: string;
  membership: Membership;
}

export default (
  websocketClient: GraaspWebsocketClient,
  queryClient: QueryClient,
) => ({
  /**
   * React hooks to subscribe to membership updates for a given item ID
   * @param itemId The ID of the item of which to observe memberships updates
   */
  useItemMembershipsUpdates: (itemId: UUID) => {
    useEffect(() => {
      if (!itemId) {
        return;
      }

      const channel: Channel = { name: itemId, topic: 'memberships/item' };
      const itemMembershipsKey = buildItemMembershipsKey(itemId);

      const handler = (event: MembershipEvent) => {
        if (event.kind === 'item') {
          const current:
            | List<Membership>
            | undefined = queryClient.getQueryData(itemMembershipsKey);
          const membership = event.membership;

          if (current && membership.itemId === itemId) {
            let mutation;
            switch (event.op) {
              case 'create': {
                if (!current.find((m) => m.id === membership.id)) {
                  mutation = current.push(membership);
                  queryClient.setQueryData(itemMembershipsKey, mutation);
                }
                break;
              }
              case 'update': {
                mutation = current.map((m) =>
                  m.id === membership.id ? membership : m,
                );
                queryClient.setQueryData(itemMembershipsKey, mutation);
                break;
              }
              case 'delete': {
                mutation = current.filter((m) => m.id !== membership.id);
                queryClient.setQueryData(itemMembershipsKey, mutation);
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
    }, [itemId]);
  },
});

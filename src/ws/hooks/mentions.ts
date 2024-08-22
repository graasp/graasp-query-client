import { Channel, ChatMention, UUID, WebsocketClient } from '@graasp/sdk';

import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { buildMentionKey } from '../../keys.js';
import { OPS, TOPICS } from '../constants.js';

// todo: use graasp-types?
interface MentionEvent {
  op: string;
  mention: ChatMention;
}

export const configureWsChatMentionsHooks = (
  websocketClient: WebsocketClient,
): { useMentionsUpdates: (memberId: UUID | null) => void } => ({
  /**
   * React hook to subscribe to the updates of the given member ID
   * @param memberId The ID of the member for which to observe updates
   */
  useMentionsUpdates: (memberId: UUID | null) => {
    const queryClient = useQueryClient();
    useEffect(() => {
      if (!memberId) {
        return () => {
          // do nothing
        };
      }

      const channel: Channel = {
        name: memberId,
        topic: TOPICS.MENTIONS,
      };

      const handler = (event: MentionEvent): void => {
        const mentionKey = buildMentionKey();
        const current: ChatMention[] | undefined =
          queryClient.getQueryData(mentionKey);

        const { mention } = event;

        if (current) {
          switch (event.op) {
            case OPS.PUBLISH: {
              const mutation = [...current, mention];
              queryClient.setQueryData(mentionKey, mutation);
              break;
            }
            case OPS.UPDATE: {
              const index = current.findIndex((m) => m.id === mention.id);
              if (index >= 0) {
                const mutation = current
                  .slice(0, index)
                  .concat(mention)
                  .concat(current.slice(index + 1));
                queryClient.setQueryData(mentionKey, mutation);
              }
              break;
            }
            case OPS.DELETE: {
              const index = current.findIndex((m) => m.id === mention.id);
              if (index >= 0) {
                const mutation = current
                  .slice(0, index)
                  .concat(current.slice(index + 1));
                queryClient.setQueryData(mentionKey, mutation);
              }
              break;
            }
            case OPS.CLEAR: {
              queryClient.setQueryData(mentionKey, []);
              break;
            }
            default:
              break;
          }
        }
      };
      websocketClient.subscribe(channel, handler);

      return function cleanup() {
        websocketClient.unsubscribe(channel, handler);
      };
    }, [memberId]);
  },
});

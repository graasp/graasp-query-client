import { ChatMention, UUID } from '@graasp/sdk';
import { Channel, WebsocketClient } from '@graasp/sdk/frontend';

import { useEffect } from 'react';
import { useQueryClient } from 'react-query';

import { buildMentionKey } from '../../config/keys';
import { OPS, TOPICS } from '../constants';

// todo: use graasp-types?
interface MentionEvent {
  op: string;
  mention: ChatMention;
}

// eslint-disable-next-line import/prefer-default-export
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
              const mutation = current.push(mention);
              queryClient.setQueryData(mentionKey, mutation);
              break;
            }
            case OPS.UPDATE: {
              // TODO !!!!! check
              current[current.findIndex((m) => m.id === mention.id)] = mention;
              queryClient.setQueryData(mentionKey, current);
              break;
            }
            case OPS.DELETE: {
              const index = current.findIndex((m) => m.id === mention.id);
              const mutation = current
                .slice(0, index)
                .concat([mention])
                .concat(current.slice(index + 1));
              queryClient.setQueryData(mentionKey, mutation);
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

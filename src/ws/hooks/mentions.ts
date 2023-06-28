import { List } from 'immutable';
import { useEffect } from 'react';
import { useQueryClient } from 'react-query';

import { ChatMention, UUID, convertJs } from '@graasp/sdk';
import { ChatMentionRecord } from '@graasp/sdk/frontend';

import { buildMentionKey } from '../../config/keys';
import { OPS, TOPICS } from '../constants';
import { Channel, WebsocketClient } from '../ws-client';

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
        const current: List<ChatMentionRecord> | undefined =
          queryClient.getQueryData(mentionKey);

        const mention: ChatMentionRecord = convertJs(event.mention);

        if (current) {
          switch (event.op) {
            case OPS.PUBLISH: {
              const mutation = current.push(mention);
              queryClient.setQueryData(mentionKey, mutation);
              break;
            }
            case OPS.UPDATE: {
              const mutation = current.update(
                current.findIndex((m) => m.id === mention.id),
                () => mention,
              );
              queryClient.setQueryData(mentionKey, mutation);
              break;
            }
            case OPS.DELETE: {
              const mutation = current.delete(
                current.findIndex((m) => m.id === mention.id),
              );
              queryClient.setQueryData(mentionKey, mutation);
              break;
            }
            case OPS.CLEAR: {
              const mutation = current.clear();
              queryClient.setQueryData(mentionKey, mutation);
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

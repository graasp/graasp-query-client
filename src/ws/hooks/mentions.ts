import { List } from 'immutable';
import { useEffect } from 'react';
import { QueryClient } from 'react-query';

import { convertJs } from '@graasp/sdk';
import {
  ChatMention,
  ChatMentionRecord,
  MemberMentionsRecord,
} from '@graasp/sdk/frontend';

import { buildMentionKey } from '../../config/keys';
import { UUID } from '../../types';
import { OPS, TOPICS } from '../constants';
import { Channel, WebsocketClient } from '../ws-client';

// todo: use graasp-types?
interface MentionEvent {
  op: string;
  mention: ChatMention;
}

// eslint-disable-next-line import/prefer-default-export
export const configureWsChatMentionsHooks = (
  queryClient: QueryClient,
  websocketClient: WebsocketClient,
): { useMentionsUpdates: (memberId: UUID | null) => void } => ({
  /**
   * React hook to subscribe to the updates of the given member ID
   * @param memberId The ID of the member for which to observe updates
   */
  useMentionsUpdates: (memberId: UUID | null) => {
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
        const mentionKey = buildMentionKey(memberId);
        const current: MemberMentionsRecord | undefined =
          queryClient.getQueryData(mentionKey);

        const mention: ChatMentionRecord = convertJs(event.mention);

        if (current) {
          switch (event.op) {
            case OPS.PUBLISH: {
              const mutation = current.update('mentions', (mentions) =>
                List([...mentions, mention]),
              );
              queryClient.setQueryData(mentionKey, mutation);
              break;
            }
            case OPS.UPDATE: {
              const mutation = current.update('mentions', (mentions) => {
                const index = mentions.findIndex(
                  (m) => m.id === event.mention.id,
                );
                return mentions.setIn([index], mention);
              });
              queryClient.setQueryData(mentionKey, mutation);
              break;
            }
            case OPS.DELETE: {
              const mutation = current.update('mentions', (mentions) =>
                mentions.filter((m) => m.id !== event.mention.id),
              );
              queryClient.setQueryData(mentionKey, mutation);
              break;
            }
            case OPS.CLEAR: {
              const mutation = current.update('mentions', () => List([]));
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

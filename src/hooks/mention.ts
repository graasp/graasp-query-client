import { convertJs } from '@graasp/sdk';
import {
  ChatMentionRecord,
  MemberRecord,
  WebsocketClient,
} from '@graasp/sdk/frontend';

import { List } from 'immutable';
import { UseQueryResult, useQuery } from 'react-query';

import * as Api from '../api/index';
import { buildMentionKey } from '../config/keys';
import { QueryClientConfig } from '../types';
import { configureWsChatMentionsHooks } from '../ws/index';

export default (
  queryConfig: QueryClientConfig,
  useCurrentMember: () => UseQueryResult<MemberRecord>,
  websocketClient?: WebsocketClient,
) => {
  const { enableWebsocket, defaultQueryOptions } = queryConfig;

  const wsHooks =
    enableWebsocket && websocketClient
      ? configureWsChatMentionsHooks(websocketClient)
      : undefined;

  return {
    useMentions: (options?: { getUpdates?: boolean }) => {
      const getUpdates = options?.getUpdates ?? enableWebsocket;

      const { data: currentMember } = useCurrentMember();
      const memberId = currentMember?.id || '';
      wsHooks?.useMentionsUpdates(getUpdates ? memberId : null);

      return useQuery({
        queryKey: buildMentionKey(),
        queryFn: (): Promise<List<ChatMentionRecord>> =>
          Api.getMemberMentions(queryConfig).then((data) => convertJs(data)),
        ...defaultQueryOptions,
        enabled: Boolean(memberId),
      });
    },
  };
};

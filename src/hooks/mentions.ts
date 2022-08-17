import { QueryClient, useQuery, UseQueryResult } from 'react-query';
import * as Api from '../api';
import { buildMentionKey } from '../config/keys';
import { Member, QueryClientConfig } from '../types';
import { WebsocketClient } from '../ws/ws-client';
import { configureWsChatMentionsHooks } from '../ws';
import { Record } from 'immutable';
import { convertJs } from '../utils/util';

export default (
  queryClient: QueryClient,
  queryConfig: QueryClientConfig,
  useCurrentMember: () => UseQueryResult,
  websocketClient?: WebsocketClient,
) => {
  const { enableWebsocket, defaultQueryOptions } = queryConfig;

  const wsHooks =
    enableWebsocket && websocketClient
      ? configureWsChatMentionsHooks(queryClient, websocketClient)
      : undefined;

  return {
    useMentions: (options?: { getUpdates?: boolean }) => {
      const getUpdates = options?.getUpdates ?? enableWebsocket;

      const { data: currentMember } = useCurrentMember();
      const memberId = (currentMember as Record<Member>)?.get('id');
      wsHooks?.useMentionsUpdates(getUpdates ? memberId : null);

      return useQuery({
        queryKey: buildMentionKey(memberId),
        queryFn: () =>
          Api.getMemberMentions(queryConfig).then((data) => convertJs(data)),
        ...defaultQueryOptions,
        enabled: Boolean(memberId),
      });
    },
  };
};

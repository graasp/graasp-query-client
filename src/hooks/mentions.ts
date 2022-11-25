import { QueryClient, UseQueryResult, useQuery } from '@tanstack/react-query';
import { Record } from 'immutable';

import { Member, convertJs } from '@graasp/sdk';

import * as Api from '../api';
import { buildMentionKey } from '../config/keys';
import { MemberMentionsRecord, QueryClientConfig } from '../types';
import { configureWsChatMentionsHooks } from '../ws';
import { WebsocketClient } from '../ws/ws-client';

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
        queryFn: (): Promise<MemberMentionsRecord> =>
          Api.getMemberMentions(queryConfig).then((data) => convertJs(data)),
        ...defaultQueryOptions,
        enabled: Boolean(memberId),
      });
    },
  };
};

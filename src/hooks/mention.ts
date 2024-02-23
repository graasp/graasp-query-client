import { CompleteMember, WebsocketClient } from '@graasp/sdk';

import { UseQueryResult, useQuery } from 'react-query';

import * as Api from '../api/index.js';
import { buildMentionKey } from '../config/keys.js';
import { QueryClientConfig } from '../types.js';
import { configureWsChatMentionsHooks } from '../ws/index.js';

export default (
  queryConfig: QueryClientConfig,
  useCurrentMember: () => UseQueryResult<CompleteMember | null>,
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
        queryFn: () => Api.getMemberMentions(queryConfig),
        ...defaultQueryOptions,
        enabled: Boolean(memberId),
      });
    },
  };
};

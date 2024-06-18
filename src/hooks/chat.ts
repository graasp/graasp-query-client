import { UUID, WebsocketClient } from '@graasp/sdk';

import { useQuery } from '@tanstack/react-query';

import * as Api from '../api/chat.js';
import { buildItemChatKey } from '../keys.js';
import { QueryClientConfig } from '../types.js';
import { configureWsChatHooks } from '../ws/index.js';

export default (
  queryConfig: QueryClientConfig,
  websocketClient?: WebsocketClient,
) => {
  const { enableWebsocket, defaultQueryOptions } = queryConfig;

  const wsHooks =
    enableWebsocket && websocketClient
      ? configureWsChatHooks(websocketClient)
      : undefined;

  return {
    useItemChat: (itemId: UUID, options?: { getUpdates?: boolean }) => {
      const getUpdates = options?.getUpdates ?? enableWebsocket;

      wsHooks?.useItemChatUpdates(getUpdates ? itemId : null);

      return useQuery({
        queryKey: buildItemChatKey(itemId),
        queryFn: () => Api.getItemChat(itemId, queryConfig),
        ...defaultQueryOptions,
        enabled: Boolean(itemId),
      });
    },
  };
};

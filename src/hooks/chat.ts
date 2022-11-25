import { QueryClient, useQuery } from '@tanstack/react-query';

import { convertJs } from '@graasp/sdk';

import * as Api from '../api';
import { buildItemChatKey } from '../config/keys';
import { ItemChatRecord, QueryClientConfig, UUID } from '../types';
import { configureWsChatHooks } from '../ws';
import { WebsocketClient } from '../ws/ws-client';

export default (
  queryClient: QueryClient,
  queryConfig: QueryClientConfig,
  websocketClient?: WebsocketClient,
) => {
  const { enableWebsocket, defaultQueryOptions } = queryConfig;

  const wsHooks =
    enableWebsocket && websocketClient
      ? configureWsChatHooks(queryClient, websocketClient)
      : undefined;

  return {
    useItemChat: (itemId: UUID, options?: { getUpdates?: boolean }) => {
      const getUpdates = options?.getUpdates ?? enableWebsocket;

      wsHooks?.useItemChatUpdates(getUpdates ? itemId : null);

      return useQuery({
        queryKey: buildItemChatKey(itemId),
        queryFn: (): Promise<ItemChatRecord> =>
          Api.getItemChat(itemId, queryConfig).then((data) => convertJs(data)),
        ...defaultQueryOptions,
        enabled: Boolean(itemId),
      });
    },
  };
};

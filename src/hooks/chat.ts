import { Map } from 'immutable';
import { QueryClient, useQuery } from 'react-query';
import * as Api from '../api';
import { buildItemChatKey } from '../config/keys';
import { ChatMessage, QueryClientConfig, UUID } from '../types';
import { configureWsChatHooks } from '../ws';
import { WebsocketClient } from '../ws/ws-client';

export default (
  queryClient: QueryClient,
  queryConfig: QueryClientConfig,
  websocketClient?: WebsocketClient,
) => {
  const { retry, cacheTime, staleTime, enableWebsocket } = queryConfig;
  const defaultOptions = {
    retry,
    cacheTime,
    staleTime,
  };

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
        queryFn: () =>
          Api.getItemChat(itemId, queryConfig).then((data) => Map<unknown, string|ChatMessage[]>(data)),
        ...defaultOptions,
        enabled: Boolean(itemId),
      });
    },
  };
};

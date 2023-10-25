import { ExportedItemChat, ItemChat, UUID } from '@graasp/sdk';
import { WebsocketClient } from '@graasp/sdk/frontend';

import { useQuery } from 'react-query';

import * as Api from '../api';
import { buildExportItemChatKey, buildItemChatKey } from '../config/keys';
import { QueryClientConfig } from '../types';
import { configureWsChatHooks } from '../ws';

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
        queryFn: (): Promise<ItemChat> =>
          Api.getItemChat(itemId, queryConfig).then((data) => data),
        ...defaultQueryOptions,
        enabled: Boolean(itemId),
      });
    },
    useExportItemChat: (
      itemId: UUID,
      options: { enabled: boolean } = { enabled: true },
    ) =>
      useQuery({
        queryKey: buildExportItemChatKey(itemId),
        queryFn: (): Promise<ExportedItemChat> =>
          Api.exportItemChat(itemId, queryConfig).then((data) => data),
        ...defaultQueryOptions,
        enabled: Boolean(itemId) && options.enabled,
      }),
  };
};

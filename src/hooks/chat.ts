import { UUID, convertJs } from '@graasp/sdk';
import {
  ExportedItemChatRecord,
  ItemChatRecord,
  WebsocketClient,
} from '@graasp/sdk/frontend';

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
        queryFn: (): Promise<ItemChatRecord> =>
          Api.getItemChat(itemId, queryConfig).then((data) => convertJs(data)),
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
        queryFn: (): Promise<ExportedItemChatRecord> =>
          Api.exportItemChat(itemId, queryConfig).then((data) =>
            convertJs(data),
          ),
        ...defaultQueryOptions,
        enabled: Boolean(itemId) && options.enabled,
      }),
  };
};

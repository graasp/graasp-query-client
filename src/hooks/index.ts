import { QueryClient } from 'react-query';
import { QueryClientConfig } from '../types';
import { WebsocketClient } from '../ws/ws-client';
import configureChatHooks from './chat';
import configureItemHooks from './item';
import configureItemFlagHooks from './itemFlag';
import configureItemTagHooks from './itemTag';
import configureMemberHooks from './member';
import configureAppsHooks from './apps'

export default (
  queryClient: QueryClient,
  queryConfig: QueryClientConfig,
  websocketClient?: WebsocketClient,
) => {
  const memberHooks = configureMemberHooks(queryClient, queryConfig);

  return {
    ...configureChatHooks(queryClient, queryConfig, websocketClient),
    ...configureItemHooks(
      queryClient,
      queryConfig,
      memberHooks.useCurrentMember,
      websocketClient,
    ),
    ...configureItemTagHooks(queryConfig),
    ...configureItemFlagHooks(queryConfig),
    ...configureAppsHooks(queryConfig),
    ...memberHooks,
  };
};

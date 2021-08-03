import { QueryClient } from 'react-query';
import { GraaspWebsocketClient } from '../ws-client';
import configureChatHooks from './chat';
import configureItemHooks from './item';
import configureMembershipHooks from './membership';

export default (
  websocketClient: GraaspWebsocketClient,
  queryClient: QueryClient,
) => {
  return {
    ...configureItemHooks(websocketClient, queryClient),
    ...configureMembershipHooks(websocketClient, queryClient),
    ...configureChatHooks(websocketClient, queryClient),
  };
};

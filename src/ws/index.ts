/**
 * Graasp websocket client top-level file
 * Entry point to use the Graasp WebSocket client in front-end applications
 *
 * @author Alexandre CHAU
 */

import { QueryClient } from 'react-query';
import { QueryClientConfig } from '../types';
import configureWebsocketHooks from './hooks';
import { configureWebsocketClient } from './ws-client';

// to be called by the main query client configurator
export default (queryClient: QueryClient, queryConfig: QueryClientConfig) => {
  const websocketClient = configureWebsocketClient(queryConfig);

  return {
    hooks: configureWebsocketHooks(websocketClient, queryClient),
  };
};

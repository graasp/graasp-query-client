import { Channel } from '@graasp/sdk';

import { QueryClient } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import React from 'react';
import { vi } from 'vitest';

import configureAxios from '../src/api/axios.js';
import configureQueryClient from '../src/queryClient.js';
import { Notifier, QueryClientConfig } from '../src/types.js';
import { API_HOST, DOMAIN, WS_HOST } from './constants.js';

export type Handler = { channel: Channel; handler: (event: unknown) => void };

const MockedWebsocket = (handlers: Handler[]) => ({
  subscribe: vi.fn((channel, handler) => {
    handlers.push({ channel, handler });
  }),
  unsubscribe: vi.fn(),
});

export const setUpWsTest = (args?: {
  enableWebsocket?: boolean;
  notifier?: Notifier;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  configureWsHooks: Function;
}) => {
  const {
    notifier = () => {
      // do nothing
    },
    configureWsHooks = () => {
      // do nothing
    },
  } = args ?? {};
  const axios = configureAxios();
  const queryConfig: QueryClientConfig = {
    API_HOST,
    DOMAIN,
    axios,
    defaultQueryOptions: {
      retry: 0,
      gcTime: 0,
      staleTime: 0,
    },
    SHOW_NOTIFICATIONS: false,
    notifier,
    enableWebsocket: true,
    WS_HOST,
  };

  const { QueryClientProvider, useMutation } =
    configureQueryClient(queryConfig);

  const handlers: Handler[] = [];
  const websocketClient = MockedWebsocket(handlers);

  // configure hooks
  const hooks = configureWsHooks(websocketClient);

  const queryClient = new QueryClient();

  const wrapper = ({
    children,
  }: {
    children: React.ReactNode;
  }): JSX.Element => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return { hooks, wrapper, queryClient, useMutation, handlers };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const mockWsHook = async ({ hook, wrapper, enabled }: any) => {
  // wait for rendering hook
  const {
    result,
  }: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    result: any;
  } = renderHook(hook, { wrapper });

  // this hook is disabled, it will never fetch
  if (enabled === false) {
    return result.current;
  }

  // return hook data
  return result.current;
};

export const getHandlerByChannel = (
  handlers: Handler[],
  channel: Channel,
): Handler | undefined =>
  handlers.find(
    ({ channel: thisChannel }) =>
      channel.name === thisChannel.name && channel.topic === thisChannel.topic,
  );

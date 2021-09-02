import React from 'react';
import { renderHook, WaitFor } from '@testing-library/react-hooks';
import { QueryClientConfig } from '../src/types';
import { API_HOST } from './constants';
import configureQueryClient from '../src/queryClient';
import { Channel } from '../src/ws/ws-client';

export type Handler = { channel: Channel; handler: Function };

const MockedWebsocket = (handlers: Handler[]) => ({
  subscribe: jest.fn((channel, handler) => {
    // eslint-disable-next-line no-param-reassign
    handlers.push({ channel, handler });
  }),
  unsubscribe: jest.fn(),
});

export const setUpWsTest = (args?: {
  enableWebsocket?: boolean;
  notifier?: (payload: any) => void;
  configureWsHooks: Function;
}) => {
  const { notifier = () => {}, configureWsHooks = () => {} } = args ?? {};
  const queryConfig: QueryClientConfig = {
    API_HOST,
    retry: 0,
    cacheTime: 0,
    staleTime: 0,
    S3_FILES_HOST: API_HOST,
    SHOW_NOTIFICATIONS: false,
    notifier,
    enableWebsocket: true,
    WS_HOST: 'ws host',
  };

  const {
    queryClient,
    QueryClientProvider,
    useMutation,
  } = configureQueryClient(queryConfig);

  const handlers: Handler[] = [];
  const websocketClient = MockedWebsocket(handlers);

  // configure hooks
  const hooks = configureWsHooks(queryClient, websocketClient);

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return { hooks, wrapper, queryClient, useMutation, handlers };
};

export const mockWsHook = async ({ hook, wrapper, enabled }: any) => {
  // wait for rendering hook
  const {
    result,
    waitFor,
  }: {
    result: any;
    waitFor: WaitFor;
  } = renderHook(hook, { wrapper });

  // this hook is disabled, it will never fetch
  if (enabled === false) {
    return result.current;
  }

  await waitFor(() => result.current);

  // return hook data
  return result.current;
};

export const getHandlerByChannel = (handlers: Handler[], channel: Channel) =>
  handlers.find(
    ({ channel: thisChannel }) =>
      channel.name === thisChannel.name && channel.topic === thisChannel.topic,
  );

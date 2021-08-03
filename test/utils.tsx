/* eslint-disable import/no-extraneous-dependencies */
import React from 'react';
import {
  renderHook,
  RenderResult,
  WaitFor,
} from '@testing-library/react-hooks';
import nock from 'nock';
import { QueryObserverBaseResult, MutationObserverResult } from 'react-query';
import configureHooks from '../src/hooks';
import { QueryClientConfig } from '../src/types';
import { API_HOST } from './constants';
import configureQueryClient from '../src/queryClient';
import { REQUEST_METHODS } from '../src/api/utils';
import { StatusCodes } from 'http-status-codes';

export const setUpTest = ({ enableWebsocket = false } = {}) => {
  const queryConfig: QueryClientConfig = {
    API_HOST,
    retry: 0,
    cacheTime: 0,
    staleTime: 0,
    S3_FILES_HOST: API_HOST,
    SHOW_NOTIFICATIONS: false,
    notifier: () => {},
    enableWebsocket,
    WS_HOST: 'ws host',
  };

  const {
    queryClient,
    QueryClientProvider,
    useMutation,
  } = configureQueryClient(queryConfig);

  // configure hooks
  const hooks = configureHooks(queryClient, queryConfig);

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return { hooks, wrapper, queryClient, useMutation };
};

export type Endpoint = {
  route: string;
  response: any;
  method?: REQUEST_METHODS;
  statusCode?: number;
};

interface MockArguments {
  endpoints: Endpoint[];
  wrapper: ({ children }: { children: React.ReactNode }) => JSX.Element;
}

interface MockHookArguments extends MockArguments {
  hook: () => any;
  enabled?: boolean;
}
interface MockMutationArguments extends MockArguments {
  mutation: () => any;
}

export const mockEndpoints = (endpoints: Endpoint[]) => {
  // mock endpoint with given response
  const server = nock(API_HOST);
  endpoints.forEach(({ route, method, statusCode, response }) => {
    server[(method || REQUEST_METHODS.GET).toLowerCase()](route).reply(
      statusCode || StatusCodes.OK,
      response,
    );
  });
  return server;
};

export const mockHook = async ({
  endpoints,
  hook,
  wrapper,
  enabled,
}: MockHookArguments) => {
  mockEndpoints(endpoints);

  // wait for rendering hook
  const {
    result,
    waitFor,
  }: {
    result: RenderResult<QueryObserverBaseResult>;
    waitFor: WaitFor;
  } = renderHook(hook, { wrapper });

  // this hook is disabled, it will never fetch
  if (enabled === false) {
    return result.current;
  }

  await waitFor(() => result.current.isSuccess || result.current.isError);

  // return hook data
  return result.current;
};

export const mockMutation = async ({
  mutation,
  wrapper,
  endpoints,
}: MockMutationArguments) => {
  mockEndpoints(endpoints);

  // wait for rendering hook
  const {
    result,
    waitFor,
  }: {
    // data, error and variables types are always different
    result: RenderResult<MutationObserverResult<any, any, any>>;
    waitFor: WaitFor;
  } = renderHook(mutation, { wrapper });
  await waitFor(() => result.current.isIdle);

  // return mutation data
  return result.current;
};

// util function to wait some time after a mutation is performed
// this is necessary for success and error callback to fully execute
export const waitForMutation = async (t: number = 500) => {
  await new Promise((r) => setTimeout(r, t));
};

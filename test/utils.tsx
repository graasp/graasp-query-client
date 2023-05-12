import {
  RenderResult,
  WaitFor,
  renderHook,
} from '@testing-library/react-hooks';
import { StatusCodes } from 'http-status-codes';
import nock, { InterceptFunction, ReplyHeaders, Scope } from 'nock';
import React from 'react';
import { MutationObserverResult, QueryObserverBaseResult } from 'react-query';

import { HttpMethod, spliceIntoChunks } from '@graasp/sdk';

import configureHooks from '../src/hooks';
import configureQueryClient from '../src/queryClient';
import { Notifier, QueryClientConfig } from '../src/types';
import { isDataEqual } from '../src/utils/util';
import { API_HOST, DOMAIN, WS_HOST } from './constants';

type Args = { enableWebsocket?: boolean; notifier?: Notifier };

export const setUpTest = (args?: Args) => {
  const {
    enableWebsocket = false,
    notifier = () => {
      // do nothing
    },
  } = args ?? {};
  const queryConfig: QueryClientConfig = {
    API_HOST,
    DOMAIN,
    defaultQueryOptions: {
      retry: 0,
      cacheTime: 0,
      staleTime: 0,
      isDataEqual,
    },
    SHOW_NOTIFICATIONS: false,
    notifier,
    enableWebsocket,
    WS_HOST,
  };

  const { queryClient, QueryClientProvider, mutations } =
    configureQueryClient(queryConfig);

  // configure hooks
  const hooks = configureHooks(queryClient, queryConfig);

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return { hooks, wrapper, queryClient, mutations };
};

export type Endpoint = {
  route: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  response: any;
  method?: HttpMethod;
  statusCode?: number;
  headers?: ReplyHeaders;
};

interface MockArguments {
  endpoints?: Endpoint[];
  wrapper: (args: { children: React.ReactNode }) => JSX.Element;
}

interface MockHookArguments extends MockArguments {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  hook: () => any;
  enabled?: boolean;
}
interface MockMutationArguments extends MockArguments {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mutation: () => any;
}

// const parseDateToString = (data: any): any => {
//   if (!data) {
//     return data;
//   }
//   if (Array.isArray(data)) {
//     return data.map(parseDateToString);
//   }
//   if (typeof data === 'object') {
//     const d = Object.entries(data).map(([k, v]) => {
//       if (v instanceof Date) {
//         return [k, v.toISOString()];
//       }
//       if (Array.isArray(v)) {
//         return [k, parseDateToString(v)];
//       }
//       if (typeof v === 'object') {
//         return [k, parseDateToString(v)];
//       }
//       return [k, v];
//     });
//     return Object.fromEntries(d);
//   }

//   return data;
// };

type NockMethodType = {
  [MethodName in keyof Scope]: Scope[MethodName] extends InterceptFunction
    ? MethodName
    : never;
}[keyof Scope];

export const mockEndpoints = (endpoints: Endpoint[]) => {
  // mock endpoint with given response
  const server = nock(API_HOST);
  endpoints.forEach(({ route, method, statusCode, response, headers }) => {
    server[(method || HttpMethod.GET).toLowerCase() as NockMethodType](
      route,
    ).reply(statusCode || StatusCodes.OK, response, headers);
  });
  return server;
};

export const mockHook = async <T,>({
  endpoints,
  hook,
  wrapper,
  enabled,
}: MockHookArguments) => {
  if (endpoints) {
    mockEndpoints(endpoints);
  }
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
  return result.current as QueryObserverBaseResult<T>;
};

export const mockMutation = async ({
  mutation,
  wrapper,
  endpoints,
}: MockMutationArguments) => {
  if (endpoints) {
    mockEndpoints(endpoints);
  }

  // wait for rendering hook
  const {
    result,
    waitFor,
  }: {
    // data, error and variables types are always different
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    result: RenderResult<MutationObserverResult<any, any, any>>;
    waitFor: WaitFor;
  } = renderHook(mutation, { wrapper });
  await waitFor(() => result.current.isIdle);

  // return mutation data
  return result.current;
};

// util function to wait some time after a mutation is performed
// this is necessary for success and error callback to fully execute
export const waitForMutation = async (t = 500) => {
  await new Promise((r) => {
    setTimeout(r, t);
  });
};

export const splitEndpointByIds = (
  ids: string[],
  chunkSize: number,
  buildRoute: (ids: string[]) => string,
  response: any[],
  getKey?: (d: any) => string,
  method?: HttpMethod,
) =>
  spliceIntoChunks(ids, chunkSize).map((chunk, idx) => {
    const data = response.slice(idx * chunkSize, (idx + 1) * chunkSize).reduce(
      (prev, d) => ({
        ...prev,
        [getKey?.(d) ?? d.id]: d,
      }),
      {},
    );
    return {
      route: buildRoute(chunk),
      response: {
        data,
        errors: [],
      },
      method,
    };
  });

export const splitEndpointByIdsForErrors = (
  ids: string[],
  chunkSize: number,
  buildRoute: (ids: string[]) => string,
  data: { response: unknown; statusCode: StatusCodes },
  method?: HttpMethod,
) =>
  spliceIntoChunks(ids, chunkSize).map((chunk) => ({
    route: buildRoute(chunk),
    ...data,
    method,
  }));

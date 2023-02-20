import { AxiosError } from 'axios';
import { StatusCodes } from 'http-status-codes';
import {
  Hydrate,
  QueryClient,
  QueryClientProvider,
  dehydrate,
  useMutation,
} from 'react-query';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { ReactQueryDevtools } from 'react-query/devtools';

import {
  CACHE_TIME_MILLISECONDS,
  STALE_TIME_MILLISECONDS,
} from './config/constants';
import configureHooks from './hooks';
import configureMutations from './mutations';
import type { QueryClientConfig } from './types';
import { getHostname, isDataEqual } from './utils/util';
import { configureWebsocketClient } from './ws';

/* istanbul ignore next */
// Query client retry function decides when and how many times a request should be retried
const retry = (failureCount: number, error: Error): boolean => {
  const response = (error as AxiosError)?.response;
  const codes = [
    StatusCodes.UNAUTHORIZED,
    StatusCodes.NOT_FOUND,
    StatusCodes.BAD_REQUEST,
    StatusCodes.FORBIDDEN,
    StatusCodes.INTERNAL_SERVER_ERROR,
  ];

  if (response) {
    // do not retry if the request was not authorized
    // the user is probably not signed in
    if (codes.includes(response.status)) {
      return false;
    }

    return failureCount < 3;
  }

  // never retry -> this might be a code error
  return false;
};

export default (config: Partial<QueryClientConfig>) => {
  const baseConfig = {
    API_HOST:
      config?.API_HOST ||
      process.env.REACT_APP_API_HOST ||
      'http://localhost:3000',
    SHOW_NOTIFICATIONS:
      config?.SHOW_NOTIFICATIONS ||
      process.env.REACT_APP_SHOW_NOTIFICATIONS === 'true' ||
      false,
    DOMAIN: config.DOMAIN ?? getHostname(),
  };

  // define config for query client
  const queryConfig: QueryClientConfig = {
    ...baseConfig,
    // derive WS_HOST from API_HOST if needed
    WS_HOST:
      config?.WS_HOST ||
      process.env.REACT_APP_WS_HOST ||
      `${baseConfig.API_HOST.replace('http', 'ws')}/ws`,
    // whether websocket support should be enabled
    enableWebsocket: config?.enableWebsocket || false,
    notifier: config?.notifier,
    // default hooks & mutation config
    defaultQueryOptions: {
      retry,
      staleTime: STALE_TIME_MILLISECONDS,
      cacheTime: CACHE_TIME_MILLISECONDS,
      keepPreviousData: false,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      notifyOnChangeProps: 'tracked',
      isDataEqual,
      ...config?.defaultQueryOptions,
    },
  };

  // create queryclient
  const queryClient = new QueryClient();

  // set up mutations given config
  // mutations are attached to queryClient
  const mutations = configureMutations(queryClient, queryConfig);

  // set up hooks given config
  const websocketClient = queryConfig.enableWebsocket
    ? configureWebsocketClient(queryConfig)
    : undefined;
  const hooks = configureHooks(queryClient, queryConfig, websocketClient);

  // returns the queryClient and relative instances
  return {
    queryClient,
    QueryClientProvider,
    hooks,
    useMutation,
    ReactQueryDevtools,
    dehydrate,
    Hydrate,
    mutations,
  };
};

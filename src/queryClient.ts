import { configureWebsocketClient } from '@graasp/sdk';

import { AxiosError } from 'axios';
import { StatusCodes } from 'http-status-codes';
import {
  Hydrate,
  QueryClient,
  QueryClientProvider,
  dehydrate,
  focusManager,
  useMutation,
  useQueryClient,
} from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';

import configureAxios from './api/axios.js';
import {
  CACHE_TIME_MILLISECONDS,
  STALE_TIME_MILLISECONDS,
} from './config/constants.js';
import configureHooks from './hooks/index.js';
import configureMutations from './mutations/index.js';
import type { QueryClientConfig } from './types.js';
import { getHostname } from './utils/util.js';

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

export type ConfigureQueryClientConfig = Partial<
  Pick<
    QueryClientConfig,
    | 'API_HOST'
    | 'DOMAIN'
    | 'SHOW_NOTIFICATIONS'
    | 'onConfigAxios'
    | 'enableWebsocket'
    | 'WS_HOST'
    | 'notifier'
    | 'defaultQueryOptions'
  >
>;

export default (config: ConfigureQueryClientConfig) => {
  const baseConfig = {
    API_HOST: config.API_HOST || 'http://localhost:3000',
    SHOW_NOTIFICATIONS: config.SHOW_NOTIFICATIONS || false,
    DOMAIN: config.DOMAIN ?? getHostname(),
  };

  const axios = configureAxios();

  // apply in place changes on axios
  config.onConfigAxios?.(axios);

  // define config for query client
  const queryConfig: QueryClientConfig = {
    ...baseConfig,
    axios,
    // derive WS_HOST from API_HOST if needed
    WS_HOST:
      config.WS_HOST || `${baseConfig.API_HOST.replace('http', 'ws')}/ws`,
    // whether websocket support should be enabled
    enableWebsocket: config.enableWebsocket || false,
    notifier: config.notifier,
    // default hooks & mutation config
    defaultQueryOptions: {
      retry,
      staleTime: STALE_TIME_MILLISECONDS,
      cacheTime: CACHE_TIME_MILLISECONDS,
      keepPreviousData: false,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      notifyOnChangeProps: 'tracked',
      ...config.defaultQueryOptions,
    },
  };

  // create queryclient
  const queryClient = new QueryClient();

  // set up mutations given config
  // mutations are attached to queryClient
  const mutations = configureMutations(queryConfig);

  // set up hooks given config
  const websocketClient = queryConfig.enableWebsocket
    ? configureWebsocketClient(queryConfig.WS_HOST)
    : undefined;
  const hooks = configureHooks(queryConfig, websocketClient);

  // returns the queryClient and relative instances
  return {
    queryConfig,
    queryClient,
    useQueryClient,
    QueryClientProvider,
    hooks,
    useMutation,
    ReactQueryDevtools,
    dehydrate,
    Hydrate,
    mutations,
    axios,
    focusManager,
  };
};

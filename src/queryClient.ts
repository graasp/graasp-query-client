import { getReasonPhrase, StatusCodes } from 'http-status-codes';
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  Hydrate,
  dehydrate,
} from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import {
  CACHE_TIME_MILLISECONDS,
  STALE_TIME_MILLISECONDS,
} from './config/constants';
import configureHooks from './hooks';
import configureMutations from './mutations';
import type { QueryClientConfig } from './types';
import { configureWebsocketClient } from './ws';

export type Notifier = (e: any) => any;

// Query client retry function decides when and how many times a request should be retried
const retry = (failureCount: number, error: Error) => {
  // do not retry if the request was not authorized
  // the user is probably not signed in
  if (error.name === getReasonPhrase(StatusCodes.UNAUTHORIZED)) {
    return false;
  }
  return failureCount < 3
};

export default (config: Partial<QueryClientConfig>) => {
  const baseConfig = {
    API_HOST:
      config?.API_HOST ||
      process.env.REACT_APP_API_HOST ||
      'http://localhost:3111',
    S3_FILES_HOST:
      config?.S3_FILES_HOST ||
      process.env.REACT_APP_S3_FILES_HOST ||
      'localhost',
    SHOW_NOTIFICATIONS:
      config?.SHOW_NOTIFICATIONS ||
      process.env.REACT_APP_SHOW_NOTIFICATIONS === 'true' ||
      false,
    keepPreviousData: config?.keepPreviousData || false,
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
    // time until data in cache considered stale if cache not invalidated
    staleTime: config?.staleTime || STALE_TIME_MILLISECONDS,
    // time before cache labeled as inactive to be garbage collected
    cacheTime: config?.cacheTime || CACHE_TIME_MILLISECONDS,
    retry,
  };

  // create queryclient with given config
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: config?.refetchOnWindowFocus || false,
      },
    },
  });

  // set up mutations given config
  // mutations are attached to queryClient
  configureMutations(queryClient, queryConfig);

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
  };
};

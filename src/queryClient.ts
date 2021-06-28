import { getReasonPhrase, StatusCodes } from 'http-status-codes';
import { QueryClient, QueryClientProvider, useMutation } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import {
  CACHE_TIME_MILLISECONDS,
  STALE_TIME_MILLISECONDS,
} from './config/constants';
import configureHooks from './hooks';
import configureMutations from './mutations';
import configureWebsockets from './ws';

export type Notifier = (e: any) => any;

type QueryClientConfig = {
  API_HOST: string;
  S3_FILES_HOST?: string;
  SHOW_NOTIFICATIONS?: boolean;
  WS_HOST?: string;
  enableWebsocket?: boolean;
  notifier?: Notifier;
};

// Query client retry function decides when and how many times a request should be retried
const retry = (failureCount: any, error: { name: string }) => {
  // do not retry if the request was not authorized
  // the user is probably not signed in
  if (error.name === getReasonPhrase(StatusCodes.UNAUTHORIZED)) {
    return 0;
  }
  return failureCount;
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
  };

  // define config for query client
  const queryConfig = {
    ...baseConfig,
    // derive WS_HOST from API_HOST if needed
    WS_HOST:
      config?.WS_HOST ||
      process.env.REACT_APP_WS_HOST ||
      `${baseConfig.API_HOST.replace('http', 'ws')}/ws`,
    // wether websocket support should be enabled
    enableWebsocket: config?.enableWebsocket ?? true,
    notifier: config?.notifier,
    // time until data in cache considered stale if cache not invalidated
    staleTime: STALE_TIME_MILLISECONDS,
    // time before cache labeled as inactive to be garbage collected
    cacheTime: CACHE_TIME_MILLISECONDS,
    retry,
  };

  // create queryclient with given config
  const queryClient = new QueryClient();

  // set up mutations given config
  // mutations are attached to queryClient
  configureMutations(queryClient, queryConfig);

  // set up hooks given config
  const hooks = configureHooks(queryClient, queryConfig);

  // set up websocket client and hooks given config
  const ws = queryConfig.enableWebsocket
    ? { ws: configureWebsockets(queryClient, queryConfig) }
    : {};

  // returns the queryClient and relative instances
  return {
    queryClient,
    QueryClientProvider,
    hooks,
    ...ws,
    useMutation,
    ReactQueryDevtools,
  };
};

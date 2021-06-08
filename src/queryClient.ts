import { QueryClient, QueryClientProvider, useMutation } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { getReasonPhrase, StatusCodes } from 'http-status-codes';
import configureMutations from './mutations';
import configureHooks from './hooks';
import {
  CACHE_TIME_MILLISECONDS,
  STALE_TIME_MILLISECONDS,
} from './config/constants';

export type Notifier = (e: any) => any;

type QueryClientConfig = {
  API_HOST: string;
  S3_FILES_HOST?: string;
  SHOW_NOTIFICATIONS?: boolean;
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
  // define config for query client
  const queryConfig = {
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

  // returns the queryClient and relative instances
  return {
    queryClient,
    QueryClientProvider,
    hooks,
    useMutation,
    ReactQueryDevtools,
  };
};

import { QueryClient, QueryClientProvider, useMutation } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { getReasonPhrase, StatusCodes } from 'http-status-codes';
import configureMutations from './mutations';
import type { QueryClientConfig, UUID } from './types';
// import buildApiCalls from './api'
import configureHooks from './hooks';
import {
  CACHE_TIME_MILLISECONDS,
  STALE_TIME_MILLISECONDS,
} from './config/constants';

type Hooks = {
  useOwnItems: () => {};
  useItem: (id: UUID) => {};
  useSharedItems: () => {};
  useChildren: (itemId: UUID) => {};
  useParents: () => {};
  useItemMemberships: (id: UUID) => {};
  useItemLogin: () => {};
};

export default (config: QueryClientConfig) => {
  const queryConfig = {
    API_HOST:
      config.API_HOST ||
      process.env.REACT_APP_API_HOST ||
      'http://localhost:3111',
    S3_FILES_HOST:
      config.S3_FILES_HOST ||
      process.env.REACT_APP_S3_FILES_HOST ||
      'localhost',
    SHOW_NOTIFICATIONS:
      config.SHOW_NOTIFICATIONS ||
      process.env.REACT_APP_SHOW_NOTIFICATIONS === 'true' ||
      false,

    notifier: config.notifier,

    staleTime: STALE_TIME_MILLISECONDS, // time until data in cache considered stale if cache not invalidated
    cacheTime: CACHE_TIME_MILLISECONDS, // time before cache labeled as inactive to be garbage collected
    retry: (failureCount: any, error: { name: string }) => {
      // do not retry if the request was not authorized
      // the user is probably not signed in
      if (error.name === getReasonPhrase(StatusCodes.UNAUTHORIZED)) {
        return 0;
      }
      return failureCount;
    },
  };

  // const apiCalls = buildApiCalls(queryConfig)

  const queryClient = new QueryClient();

  configureMutations(queryClient, queryConfig);
  const hooks: Hooks = configureHooks(queryClient, queryConfig);

  return {
    queryClient,
    QueryClientProvider,
    hooks,
    useMutation,
    ReactQueryDevtools,
  };
};

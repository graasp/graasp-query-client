import { QueryClient } from 'react-query';
import configureItemHooks from './item';
import configureMemberHooks from './member';
import configureItemTagHooks from './itemTag';
import configureItemFlagHooks from './itemFlag';
import { QueryClientConfig } from '../types';

export default (queryClient: QueryClient, queryConfig: QueryClientConfig) => ({
  ...configureItemHooks(queryClient, queryConfig),
  ...configureMemberHooks(queryConfig),
  ...configureItemTagHooks(queryConfig),
  ...configureItemFlagHooks(queryConfig),
});

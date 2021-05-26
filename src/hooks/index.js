import configureItemHooks from './item';
import configureMemberHooks from './member';
import configureItemTagHooks from './itemTag';

export default (queryClient, queryConfig) => ({
  ...configureItemHooks(queryClient, queryConfig),
  ...configureMemberHooks(queryClient, queryConfig),
  ...configureItemTagHooks(queryClient, queryConfig),
});

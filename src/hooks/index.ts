import { QueryClient } from '@tanstack/react-query';

import { QueryClientConfig } from '../types';
import { WebsocketClient } from '../ws/ws-client';
import configureActionHooks from './action';
import configureAppsHooks from './apps';
import configureCategoryHooks from './category';
import configureChatHooks from './chat';
import configureInvitationHooks from './invitation';
import configureItemHooks from './item';
import configureItemFlagHooks from './itemFlag';
import configureItemLikeHooks from './itemLike';
import configureItemTagHooks from './itemTag';
import configureItemValidationHooks from './itemValidation';
import configureMemberHooks from './member';
import configureMembershipHooks from './membership';
import configureMentionsHooks from './mentions';
import configurePlanHooks from './plan';
import configureKeywordSearchHooks from './search';

export default (
  queryClient: QueryClient,
  queryConfig: QueryClientConfig,
  websocketClient?: WebsocketClient,
) => {
  const memberHooks = configureMemberHooks(queryClient, queryConfig);

  return {
    ...configureChatHooks(queryClient, queryConfig, websocketClient),
    ...configureMentionsHooks(
      queryClient,
      queryConfig,
      memberHooks.useCurrentMember,
      websocketClient,
    ),
    ...configureMembershipHooks(queryClient, queryConfig, websocketClient),
    ...configureItemHooks(
      queryClient,
      queryConfig,
      memberHooks.useCurrentMember,
      websocketClient,
    ),
    ...configureItemTagHooks(queryConfig, queryClient),
    ...configureItemFlagHooks(queryConfig),
    ...configureCategoryHooks(queryConfig),
    ...configureKeywordSearchHooks(queryConfig),
    ...configureItemLikeHooks(queryConfig),
    ...configureItemValidationHooks(queryConfig),
    ...configureAppsHooks(queryConfig),
    ...configureActionHooks(queryConfig),
    ...configureInvitationHooks(queryConfig),
    ...memberHooks,
    ...configurePlanHooks(queryConfig),
  };
};

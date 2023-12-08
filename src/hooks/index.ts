import { WebsocketClient } from '@graasp/sdk';

import { QueryClientConfig } from '../types';
import configureActionHooks from './action';
import configureAppsHooks from './apps';
import configureCategoryHooks from './category';
import configureChatHooks from './chat';
import configureInvitationHooks from './invitation';
import configureItemHooks from './item';
import configureItemFavoriteHooks from './itemFavorite';
import configureItemLikeHooks from './itemLike';
import configureItemLoginHooks from './itemLogin';
import configureItemPublishedHooks from './itemPublish';
import configureItemTagHooks from './itemTag';
import configureItemValidationHooks from './itemValidation';
import configureMemberHooks from './member';
import configureMembershipHooks from './membership';
import configureMentionsHooks from './mention';
import configurePlanHooks from './plan';
import configurePublicProfileHooks from './publicProfile';
import configureKeywordSearchHooks from './search';
import configureShortLinkHooks from './shortLink';

export default (
  queryConfig: QueryClientConfig,
  websocketClient?: WebsocketClient,
) => {
  const memberHooks = configureMemberHooks(queryConfig);

  return {
    ...configureChatHooks(queryConfig, websocketClient),
    ...configureMentionsHooks(
      queryConfig,
      memberHooks.useCurrentMember,
      websocketClient,
    ),
    ...configureMembershipHooks(queryConfig, websocketClient),
    ...configureItemHooks(
      queryConfig,
      memberHooks.useCurrentMember,
      websocketClient,
    ),
    ...configureItemTagHooks(queryConfig),
    ...configureCategoryHooks(queryConfig),
    ...configureKeywordSearchHooks(queryConfig),
    ...configureItemLikeHooks(queryConfig),
    ...configureItemLoginHooks(queryConfig),
    ...configureItemPublishedHooks(queryConfig),
    ...configureItemValidationHooks(queryConfig),
    ...configureItemFavoriteHooks(queryConfig),
    ...configureAppsHooks(queryConfig),
    ...configureActionHooks(queryConfig),
    ...configureInvitationHooks(queryConfig),
    ...memberHooks,
    ...configurePlanHooks(queryConfig),
    ...configurePublicProfileHooks(queryConfig),
    ...configureShortLinkHooks(queryConfig),
  };
};

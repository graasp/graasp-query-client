import { WebsocketClient } from '@graasp/sdk';

import { QueryClientConfig } from '../types.js';
import configureActionHooks from './action.js';
import configureAppsHooks from './apps.js';
import configureCategoryHooks from './category.js';
import configureChatHooks from './chat.js';
import configureEmbeddedLinkHooks from './embeddedLink.js';
import configureEtherpadHooks from './etherpad.js';
import configureInvitationHooks from './invitation.js';
import configureItemHooks from './item.js';
import configureItemBookmarkHooks from './itemBookmark.js';
import configureItemGeolocationHooks from './itemGeolocation.js';
import configureItemLikeHooks from './itemLike.js';
import configureItemLoginHooks from './itemLogin.js';
import configureItemPublishedHooks from './itemPublish.js';
import configureItemTagHooks from './itemTag.js';
import configureItemValidationHooks from './itemValidation.js';
import configureMemberHooks from './member.js';
import configureMembershipHooks from './membership.js';
import configureMentionsHooks from './mention.js';
import configurePublicProfileHooks from './publicProfile.js';
import configureKeywordSearchHooks from './search.js';
import configureShortLinkHooks from './shortLink.js';
import configureSubscriptionHooks from './subscription.js';

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
    ...configureEtherpadHooks(queryConfig),
    ...configureItemTagHooks(queryConfig),
    ...configureCategoryHooks(queryConfig),
    ...configureKeywordSearchHooks(queryConfig),
    ...configureItemLikeHooks(queryConfig),
    ...configureItemLoginHooks(queryConfig),
    ...configureItemPublishedHooks(queryConfig),
    ...configureItemValidationHooks(queryConfig),
    ...configureItemBookmarkHooks(queryConfig),
    ...configureAppsHooks(queryConfig),
    ...configureActionHooks(queryConfig),
    ...configureInvitationHooks(queryConfig),
    ...memberHooks,
    ...configureSubscriptionHooks(queryConfig),
    ...configurePublicProfileHooks(queryConfig),
    ...configureShortLinkHooks(queryConfig),
    ...configureItemGeolocationHooks(queryConfig),
    ...configureEmbeddedLinkHooks(queryConfig),
  };
};

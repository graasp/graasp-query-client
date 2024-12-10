import { WebsocketClient } from '@graasp/sdk';

import configureItemHooks from '../item/hooks.js';
import configureItemPublicationHooks from '../item/publication/hooks.js';
import { configureRecycledHooks } from '../item/recycled/hooks.js';
import configureItemTagHooks from '../item/tag/hooks.js';
import configureMemberHooks from '../member/hooks.js';
import configureMemberPasswordHooks from '../member/password/hooks.js';
import configurePublicProfileHooks from '../member/publicProfile/hooks.js';
import configureSubscriptionHooks from '../member/subscription/hooks.js';
import configureMembershipRequestHooks from '../membership/request/hooks.js';
import configureTagHooks from '../tag/hooks.js';
import { QueryClientConfig } from '../types.js';
import configureActionHooks from './action.js';
import configureAppsHooks from './apps.js';
import configureChatHooks from './chat.js';
import configureEmbeddedLinkHooks from './embeddedLink.js';
import configureEtherpadHooks from './etherpad.js';
import configureInvitationHooks from './invitation.js';
import configureItemBookmarkHooks from './itemBookmark.js';
import configureItemGeolocationHooks from './itemGeolocation.js';
import configureItemLikeHooks from './itemLike.js';
import configureItemLoginHooks from './itemLogin.js';
import configureItemPublishedHooks from './itemPublish.js';
import configureItemValidationHooks from './itemValidation.js';
import configureMembershipHooks from './membership.js';
import configureMentionsHooks from './mention.js';
import configureKeywordSearchHooks from './search.js';
import configureShortLinkHooks from './shortLink.js';
import useDebounce from './useDebounce.js';

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
    ...configureItemHooks(queryConfig, websocketClient),
    ...configureEtherpadHooks(queryConfig),
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
    ...configureItemPublicationHooks(queryConfig),
    ...configureMembershipRequestHooks(queryConfig),
    ...configureMemberPasswordHooks(queryConfig),
    ...configureRecycledHooks(queryConfig),
    ...configureTagHooks(queryConfig),
    ...configureItemTagHooks(queryConfig),
    useDebounce,
  };
};

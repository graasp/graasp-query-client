import { QueryClientConfig } from '../types.js';
import actionMutations from './action.js';
import authenticationMutations from './authentication.js';
import chatMutations from './chat.js';
import etherpadMutations from './etherpad.js';
import invitationMutations from './invitation.js';
import itemMutations from './item.js';
import itemBookmarkMutations from './itemBookmark.js';
import itemCategoryMutations from './itemCategory.js';
import itemExportMutations from './itemExport.js';
import flagsMutations from './itemFlag.js';
import itemGeolocationMutations from './itemGeolocation.js';
import itemLikeMutations from './itemLike.js';
import itemLoginMutations from './itemLogin.js';
import itemPublishMutations from './itemPublish.js';
import tagsMutations from './itemTag.js';
import itemValidationMutations from './itemValidation.js';
import memberMutations from './member.js';
import itemMembershipMutations from './membership.js';
import mentionMutations from './mention.js';
import publicProfileMutations from './publicProfile.js';
import shortLinksMutations from './shortLink.js';

const configureMutations = (queryConfig: QueryClientConfig) => ({
  ...actionMutations(queryConfig),
  ...authenticationMutations(queryConfig),
  ...chatMutations(queryConfig),
  ...etherpadMutations(queryConfig),
  ...flagsMutations(queryConfig),
  ...invitationMutations(queryConfig),
  ...itemCategoryMutations(queryConfig),
  ...itemExportMutations(queryConfig),
  ...itemBookmarkMutations(queryConfig),
  ...itemGeolocationMutations(queryConfig),
  ...itemLikeMutations(queryConfig),
  ...itemLoginMutations(queryConfig),
  ...itemMembershipMutations(queryConfig),
  ...itemMutations(queryConfig),
  ...itemPublishMutations(queryConfig),
  ...itemValidationMutations(queryConfig),
  ...memberMutations(queryConfig),
  ...mentionMutations(queryConfig),
  ...publicProfileMutations(queryConfig),
  ...shortLinksMutations(queryConfig),
  ...tagsMutations(queryConfig),
});

export default configureMutations;

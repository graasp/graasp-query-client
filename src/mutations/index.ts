import itemMutations from '../item/mutations.js';
import itemTagMutations from '../item/tag/mutations.js';
import memberMutations from '../member/mutations.js';
import publicProfileMutations from '../member/publicProfile/mutations.js';
import membershipRequestsMutations from '../membership/request/mutations.js';
import { QueryClientConfig } from '../types.js';
import actionMutations from './action.js';
import authenticationMutations from './authentication.js';
import chatMutations from './chat.js';
import csvUserImportMutations from './csvUserImport.js';
import etherpadMutations from './etherpad.js';
import invitationMutations from './invitation.js';
import itemBookmarkMutations from './itemBookmark.js';
import itemExportMutations from './itemExport.js';
import flagsMutations from './itemFlag.js';
import itemGeolocationMutations from './itemGeolocation.js';
import itemLikeMutations from './itemLike.js';
import itemLoginMutations from './itemLogin.js';
import itemPublishMutations from './itemPublish.js';
import itemValidationMutations from './itemValidation.js';
import visibilitiesMutations from './itemVisibility.js';
import itemMembershipMutations from './membership.js';
import mentionMutations from './mention.js';
import shortLinksMutations from './shortLink.js';

const configureMutations = (queryConfig: QueryClientConfig) => ({
  ...actionMutations(queryConfig),
  ...authenticationMutations(queryConfig),
  ...chatMutations(queryConfig),
  ...csvUserImportMutations(queryConfig),
  ...etherpadMutations(queryConfig),
  ...flagsMutations(queryConfig),
  ...invitationMutations(queryConfig),
  ...itemBookmarkMutations(queryConfig),
  ...itemExportMutations(queryConfig),
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
  ...visibilitiesMutations(queryConfig),
  ...membershipRequestsMutations(queryConfig),
  ...itemTagMutations(queryConfig),
});

export default configureMutations;

import { QueryClientConfig } from '../types';
import actionMutations from './action';
import authenticationMutations from './authentication';
import chatMutations from './chat';
import invitationMutations from './invitation';
import itemMutations from './item';
import itemCategoryMutations from './itemCategory';
import itemExportMutations from './itemExport';
import itemFavoriteMutations from './itemFavorite';
import flagsMutations from './itemFlag';
import itemLikeMutations from './itemLike';
import itemLoginMutations from './itemLogin';
import itemPublishMutations from './itemPublish';
import tagsMutations from './itemTag';
import itemValidationMutations from './itemValidation';
import memberMutations from './member';
import itemMembershipMutations from './membership';
import mentionMutations from './mention';
import subscriptionMutations from './plan';
import publicProfileMutations from './publicProfile';
import shortLinksMutations from './shortLink';

const configureMutations = (queryConfig: QueryClientConfig) => ({
  ...itemMutations(queryConfig),
  ...itemMembershipMutations(queryConfig),
  ...memberMutations(queryConfig),
  ...tagsMutations(queryConfig),
  ...flagsMutations(queryConfig),
  ...itemLoginMutations(queryConfig),
  ...chatMutations(queryConfig),
  ...mentionMutations(queryConfig),
  ...itemCategoryMutations(queryConfig),
  ...itemFavoriteMutations(queryConfig),
  ...itemExportMutations(queryConfig),
  ...itemLikeMutations(queryConfig),
  ...itemValidationMutations(queryConfig),
  ...actionMutations(queryConfig),
  ...invitationMutations(queryConfig),
  ...authenticationMutations(queryConfig),
  ...subscriptionMutations(queryConfig),
  ...itemPublishMutations(queryConfig),
  ...publicProfileMutations(queryConfig),
  ...shortLinksMutations(queryConfig),
});

export default configureMutations;

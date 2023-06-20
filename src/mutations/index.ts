import { QueryClient } from 'react-query';

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

const configureMutations = (
  queryClient: QueryClient,
  queryConfig: QueryClientConfig,
) => ({
  ...itemMutations(queryClient, queryConfig),
  ...itemMembershipMutations(queryClient, queryConfig),
  ...memberMutations(queryClient, queryConfig),
  ...tagsMutations(queryClient, queryConfig),
  ...flagsMutations(queryClient, queryConfig),
  ...itemLoginMutations(queryClient, queryConfig),
  ...chatMutations(queryClient, queryConfig),
  ...mentionMutations(queryClient, queryConfig),
  ...itemCategoryMutations(queryClient, queryConfig),
  ...itemFavoriteMutations(queryConfig),
  ...itemExportMutations(queryClient, queryConfig),
  ...itemLikeMutations(queryClient, queryConfig),
  ...itemValidationMutations(queryClient, queryConfig),
  ...actionMutations(queryClient, queryConfig),
  ...invitationMutations(queryClient, queryConfig),
  ...authenticationMutations(queryClient, queryConfig),
  ...subscriptionMutations(queryClient, queryConfig),
  ...itemPublishMutations(queryClient, queryConfig),
});

export default configureMutations;

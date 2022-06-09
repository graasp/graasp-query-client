import { QueryClient } from 'react-query';
import itemMutations from './item';
import memberMutations from './member';
import tagsMutations from './itemTag';
import flagsMutations from './itemFlag';
import itemLoginMutations from './itemLogin';
import itemMembershipMutations from './membership';
import chatMutations from './chat';
import itemCategoryMutations from './itemCategory';
import { QueryClientConfig } from '../types';
import itemExportMutations from './itemExport';
import itemLikeMutations from './itemLike';
import itemValidationMutations from './itemValidation';
import actionMutations from './action';
import invitationMutations from './invitation';
import authenticationMutations from './authentication';

const configureMutations = (
  queryClient: QueryClient,
  queryConfig: QueryClientConfig,
) => {
  itemMutations(queryClient, queryConfig);
  itemMembershipMutations(queryClient, queryConfig);
  memberMutations(queryClient, queryConfig);
  tagsMutations(queryClient, queryConfig);
  flagsMutations(queryClient, queryConfig);
  itemLoginMutations(queryClient, queryConfig);
  chatMutations(queryClient, queryConfig);
  itemCategoryMutations(queryClient, queryConfig);
  itemExportMutations(queryClient, queryConfig);
  itemLikeMutations(queryClient, queryConfig);
  itemValidationMutations(queryClient, queryConfig);
  actionMutations(queryClient, queryConfig);
  invitationMutations(queryClient, queryConfig);
  authenticationMutations(queryClient, queryConfig);
};

export default configureMutations;

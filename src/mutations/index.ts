import { QueryClient } from 'react-query';
import itemMutations from './item';
import memberMutations from './member';
import tagsMutations from './itemTag';
import flagsMutations from './itemFlag';
import itemMembershipMutations from './membership';
import chatMutations from './chat';
import groupMutations from './group';
import { QueryClientConfig } from '../types';

const configureMutations = (
  queryClient: QueryClient,
  queryConfig: QueryClientConfig,
) => {
  itemMutations(queryClient, queryConfig);
  groupMutations(queryClient, queryConfig);
  itemMembershipMutations(queryClient, queryConfig);
  memberMutations(queryClient, queryConfig);
  tagsMutations(queryClient, queryConfig);
  flagsMutations(queryClient, queryConfig);
  chatMutations(queryClient, queryConfig);
};

export default configureMutations;

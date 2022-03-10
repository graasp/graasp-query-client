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
import itemDownloadMutations from './itemDownload';
import itemLikeMutations from './itemLike';

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
  itemDownloadMutations(queryClient, queryConfig);
  itemLikeMutations(queryClient, queryConfig);
};

export default configureMutations;

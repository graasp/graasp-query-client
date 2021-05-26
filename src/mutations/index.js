import itemMutations from './item';
import memberMutations from './member';
// import * as tagsMutations from './itemTag';

const configureMutations = (queryClient, queryConfig) => {
  itemMutations(queryClient, queryConfig);
  memberMutations(queryClient, queryConfig);
  // tagsMutations(queryClient, notifier);
};

export default configureMutations;

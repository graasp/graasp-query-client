import { QueryClient } from 'react-query';
import * as Api from '../api';
import { signOutRoutine } from '../routines';
import { CURRENT_MEMBER_KEY, SIGN_OUT_MUTATION_KEY } from '../config/keys';
import { QueryClientConfig } from '../types';

export default (queryClient: QueryClient, { notifier }: QueryClientConfig) => {
  queryClient.setMutationDefaults(SIGN_OUT_MUTATION_KEY, {
    mutationFn: Api.signOut,
    onMutate: async () => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries(CURRENT_MEMBER_KEY);

      // Snapshot the previous value
      const previousItems = queryClient.getQueryData(CURRENT_MEMBER_KEY);

      // Optimistically update to the new value
      queryClient.setQueryData(CURRENT_MEMBER_KEY, null);

      // Return a context object with the snapshotted value
      return { previousItems };
    },
    onSuccess: () => {
      notifier?.({ type: signOutRoutine.SUCCESS });
    },
    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (error) => {
      notifier?.({ type: signOutRoutine.FAILURE, payload: { error } });
    },
    // Always refetch after error or success:
    onSettled: () => {
      // invalidate all queries
      queryClient.resetQueries();
    },
  });
};

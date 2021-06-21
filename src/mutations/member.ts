import { QueryClient } from 'react-query';
import { Map, Record } from 'immutable';
import * as Api from '../api';
import { editMemberRoutine, signOutRoutine } from '../routines';
import { CURRENT_MEMBER_KEY, MUTATION_KEYS } from '../config/keys';
import { Member, QueryClientConfig } from '../types';

export default (queryClient: QueryClient, queryConfig: QueryClientConfig) => {
  const { notifier } = queryConfig;

  queryClient.setMutationDefaults(MUTATION_KEYS.SIGN_OUT, {
    mutationFn: () => Api.signOut(queryConfig),
    onMutate: async () => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries(CURRENT_MEMBER_KEY);

      // Snapshot the previous value
      const previousMember = queryClient.getQueryData(CURRENT_MEMBER_KEY);

      // Optimistically update to the new value
      queryClient.setQueryData(CURRENT_MEMBER_KEY, null);

      // Return a context object with the snapshotted value
      return { previousMember };
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

  // suppose you can only edit yourself
  queryClient.setMutationDefaults(MUTATION_KEYS.EDIT_MEMBER, {
    mutationFn: (payload) =>
      Api.editMember(payload, queryConfig).then((member) => Map(member)),
    onMutate: async (payload) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries(CURRENT_MEMBER_KEY);

      // Snapshot the previous value
      const previousMember = queryClient.getQueryData(
        CURRENT_MEMBER_KEY,
      ) as Record<Member>;

      // Optimistically update to the new value
      queryClient.setQueryData(
        CURRENT_MEMBER_KEY,
        previousMember.merge(payload),
      );

      // Return a context object with the snapshotted value
      return { previousMember };
    },
    onSuccess: () => {
      notifier?.({ type: editMemberRoutine.SUCCESS });
    },
    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (error) => {
      notifier?.({ type: editMemberRoutine.FAILURE, payload: { error } });
    },
    // Always refetch after error or success:
    onSettled: () => {
      // invalidate all queries
      queryClient.invalidateQueries(CURRENT_MEMBER_KEY);
    },
  });
};

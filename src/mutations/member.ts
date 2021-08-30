import { QueryClient } from 'react-query';
import { Map, Record } from 'immutable';
import Cookies from 'js-cookie';
import * as Api from '../api';
import { editMemberRoutine, signOutRoutine } from '../routines';
import { CURRENT_MEMBER_KEY, MUTATION_KEYS } from '../config/keys';
import { Member, QueryClientConfig } from '../types';
import { COOKIE_SESSION_NAME } from '../config/constants';

export default (queryClient: QueryClient, queryConfig: QueryClientConfig) => {
  const { notifier } = queryConfig;

  queryClient.setMutationDefaults(MUTATION_KEYS.SIGN_OUT, {
    mutationFn: () => Api.signOut(queryConfig),
    onSuccess: () => {
      notifier?.({ type: signOutRoutine.SUCCESS });
      queryClient.resetQueries();

      // remove cookies from browser when the logout is confirmed
      Cookies.remove(COOKIE_SESSION_NAME);

      // Update when the server confirmed the logout, instead optimistically updating the member 
      // This prevents logout loop (redirect to logout -> still cookie -> logs back in)
      queryClient.setQueryData(CURRENT_MEMBER_KEY, undefined);
    },
    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (error, _args, _context) => {
      notifier?.({ type: signOutRoutine.FAILURE, payload: { error } });
    },
  });

  // suppose you can only edit yourself
  queryClient.setMutationDefaults(MUTATION_KEYS.EDIT_MEMBER, {
    mutationFn: (payload) =>
      Api.editMember(payload, queryConfig).then((member) => Map(member)),
    onMutate: async ({ member }) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries(CURRENT_MEMBER_KEY);

      // Snapshot the previous value
      const previousMember = queryClient.getQueryData(
        CURRENT_MEMBER_KEY,
      ) as Record<Member>;

      // Optimistically update to the new value
      queryClient.setQueryData(
        CURRENT_MEMBER_KEY,
        previousMember.merge(member),
      );

      // Return a context object with the snapshotted value
      return { previousMember };
    },
    onSuccess: () => {
      notifier?.({ type: editMemberRoutine.SUCCESS });
    },
    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (error, _, context) => {
      notifier?.({ type: editMemberRoutine.FAILURE, payload: { error } });
      queryClient.setQueryData(CURRENT_MEMBER_KEY, context.previousMember);
    },
    // Always refetch after error or success:
    onSettled: () => {
      // invalidate all queries
      queryClient.invalidateQueries(CURRENT_MEMBER_KEY);
    },
  });
};

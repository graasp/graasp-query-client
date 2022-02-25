import { QueryClient } from 'react-query';
import { Map, Record } from 'immutable';
import Cookies from 'js-cookie';
import { SUCCESS_MESSAGES } from '@graasp/translations';
import * as Api from '../api';
import {
  editMemberRoutine,
  signOutRoutine,
  uploadAvatarRoutine,
} from '../routines';
import {
  buildAvatarKey,
  CURRENT_MEMBER_KEY,
  MUTATION_KEYS,
} from '../config/keys';
import { Member, QueryClientConfig } from '../types';
import { COOKIE_SESSION_NAME, THUMBNAIL_SIZES } from '../config/constants';
import { throwIfArrayContainsErrorOrReturn } from '../api/axios';

export default (queryClient: QueryClient, queryConfig: QueryClientConfig) => {
  const { notifier } = queryConfig;

  queryClient.setMutationDefaults(MUTATION_KEYS.SIGN_OUT, {
    mutationFn: () => Api.signOut(queryConfig),
    onSuccess: () => {
      notifier?.({
        type: signOutRoutine.SUCCESS,
        payload: { message: SUCCESS_MESSAGES.SIGN_OUT },
      });
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
      notifier?.({
        type: editMemberRoutine.SUCCESS,
        payload: { message: SUCCESS_MESSAGES.EDIT_MEMBER },
      });
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

  // this mutation is used for its callback and invalidate the keys
  /**
   * @param {UUID} id parent item id wher the file is uploaded in
   * @param {error} [error] error occured during the file uploading
   */
  queryClient.setMutationDefaults(MUTATION_KEYS.UPLOAD_AVATAR, {
    mutationFn: async ({ error, data } = {}) => {
      throwIfArrayContainsErrorOrReturn(data);
      if (error) throw new Error(JSON.stringify(error));
    },
    onSuccess: () => {
      notifier?.({
        type: uploadAvatarRoutine.SUCCESS,
        payload: { message: SUCCESS_MESSAGES.UPLOAD_AVATAR },
      });
    },
    onError: (_error, { error }) => {
      notifier?.({ type: uploadAvatarRoutine.FAILURE, payload: { error } });
    },
    onSettled: (_data, _error, { id }) => {
      Object.values(THUMBNAIL_SIZES).forEach((size) => {
        const key = buildAvatarKey({ id, size });
        queryClient.invalidateQueries(key);
      });
    },
  });
};

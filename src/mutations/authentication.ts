import { QueryClient, useMutation } from 'react-query';

import {
  UUID,
  getStoredSessions,
  removeSession,
  saveUrlForRedirection,
  setCurrentSession,
} from '@graasp/sdk';
import { Password } from '@graasp/sdk/frontend';
import { SUCCESS_MESSAGES } from '@graasp/translations';

import * as Api from '../api';
import { CURRENT_MEMBER_KEY, MUTATION_KEYS } from '../config/keys';
import {
  signInRoutine,
  signInWithPasswordRoutine,
  signOutRoutine,
  signUpRoutine,
  switchMemberRoutine,
  updatePasswordRoutine,
} from '../routines';
import { QueryClientConfig } from '../types';
import { isServer } from '../utils/util';

const {
  SIGN_IN,
  SIGN_OUT,
  UPDATE_PASSWORD,
  SIGN_IN_WITH_PASSWORD,
  SWITCH_MEMBER,
  SIGN_UP,
} = MUTATION_KEYS;

export default (queryClient: QueryClient, queryConfig: QueryClientConfig) => {
  const { notifier } = queryConfig;

  queryClient.setMutationDefaults(SIGN_IN, {
    mutationFn: (payload) => Api.signIn(payload, queryConfig),
    onSuccess: () => {
      notifier?.({
        type: signInRoutine.SUCCESS,
        payload: { message: SUCCESS_MESSAGES.SIGN_IN },
      });
      queryClient.resetQueries();
    },
    onError: (error) => {
      notifier?.({
        type: signInRoutine.FAILURE,
        payload: { error },
      });
    },
  });
  const useSignIn = () =>
    useMutation<void, unknown, { email: string }>(SIGN_IN);

  queryClient.setMutationDefaults(SIGN_IN_WITH_PASSWORD, {
    mutationFn: (payload) => Api.signInWithPassword(payload, queryConfig),
    onSuccess: () => {
      notifier?.({
        type: signInWithPasswordRoutine.SUCCESS,
        payload: { message: SUCCESS_MESSAGES.SIGN_IN_WITH_PASSWORD },
      });
      queryClient.resetQueries();
    },
    onError: (error) => {
      notifier?.({
        type: signInWithPasswordRoutine.FAILURE,
        payload: { error },
      });
    },
  });
  const useSignInWithPassword = () =>
    useMutation<void, unknown, { email: string; password: Password }>(
      SIGN_IN_WITH_PASSWORD,
    );

  /**  mutation to update member password. suppose only you can edit yourself
   * @param {Password} password new password that user wants to set
   * @param {Password} currentPassword current password already stored
   */
  queryClient.setMutationDefaults(UPDATE_PASSWORD, {
    mutationFn: (payload) => Api.updatePassword(payload, queryConfig),
    onSuccess: () => {
      notifier?.({
        type: updatePasswordRoutine.SUCCESS,
        payload: { message: SUCCESS_MESSAGES.UPDATE_PASSWORD },
      });
    },
    onError: (error) => {
      notifier?.({
        type: updatePasswordRoutine.FAILURE,
        payload: { error },
      });
    },
  });
  const useUpdatePassword = () =>
    useMutation<
      void,
      unknown,
      { password: Password; currentPassword: Password }
    >(UPDATE_PASSWORD);

  queryClient.setMutationDefaults(SIGN_UP, {
    mutationFn: (payload) => Api.signUp(payload, queryConfig),
    onSuccess: () => {
      notifier?.({
        type: signUpRoutine.SUCCESS,
        payload: { message: SUCCESS_MESSAGES.SIGN_UP },
      });
    },
    onError: (error) => {
      notifier?.({
        type: signUpRoutine.FAILURE,
        payload: { error },
      });
    },
  });
  const useSignUp = () =>
    useMutation<void, unknown, { name: string; email: string }>(SIGN_UP);

  queryClient.setMutationDefaults(SIGN_OUT, {
    mutationFn: (_currentMemberId: UUID) => Api.signOut(queryConfig),
    onSuccess: (_res, currentUserId) => {
      notifier?.({
        type: signOutRoutine.SUCCESS,
        payload: { message: SUCCESS_MESSAGES.SIGN_OUT },
      });
      queryClient.resetQueries();

      // cookie operations only if window is defined (operation happens in the frontend)
      if (!isServer() && queryConfig.DOMAIN) {
        // save current page for further redirection
        saveUrlForRedirection(window.location.href, queryConfig.DOMAIN);
        // remove cookie and stored session from browser when the logout is confirmed
        setCurrentSession(null, queryConfig.DOMAIN);
        removeSession(currentUserId, queryConfig.DOMAIN);
      }
      // Update when the server confirmed the logout, instead optimistically updating the member
      // This prevents logout loop (redirect to logout -> still cookie -> logs back in)
      queryClient.setQueryData(CURRENT_MEMBER_KEY, undefined);
    },
    onError: (error) => {
      notifier?.({
        type: signOutRoutine.FAILURE,
        payload: { error },
      });
    },
  });
  const useSignOut = () => useMutation<void, unknown, UUID>(SIGN_OUT);

  queryClient.setMutationDefaults(SWITCH_MEMBER, {
    mutationFn: async (args: { memberId: string; domain: string }) => {
      // get token from stored sessions given memberId
      const sessions = getStoredSessions();
      const session = sessions?.find(
        ({ id: thisId }) => args.memberId === thisId,
      );
      if (!session) {
        throw new Error('Session is invalid');
      }
      setCurrentSession(session.token, args.domain);
      return args.memberId;
    },
    onSuccess: () => {
      notifier?.({ type: switchMemberRoutine.SUCCESS });
      // reset queries to take into account the new token
      queryClient.resetQueries();
    },
    onError: (error) => {
      notifier?.({
        type: switchMemberRoutine.FAILURE,
        payload: { error },
      });
    },
  });
  const useSwitchMember = () => useMutation<void, unknown, void>(SWITCH_MEMBER);

  return {
    useSwitchMember,
    useSignIn,
    useSignInWithPassword,
    useSignOut,
    useSignUp,
    useUpdatePassword,
  };
};

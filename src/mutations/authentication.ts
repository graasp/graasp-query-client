import { MemberExtra, UUID, saveUrlForRedirection } from '@graasp/sdk';
import { Password } from '@graasp/sdk/frontend';
import { SUCCESS_MESSAGES } from '@graasp/translations';

import { useMutation, useQueryClient } from 'react-query';

import * as Api from '../api';
import { CURRENT_MEMBER_KEY } from '../config/keys';
import {
  signInRoutine,
  signInWithPasswordRoutine,
  signOutRoutine,
  signUpRoutine,
  updatePasswordRoutine,
} from '../routines';
import { QueryClientConfig } from '../types';
import { isServer } from '../utils/util';

export default (queryConfig: QueryClientConfig) => {
  const { notifier } = queryConfig;

  const useSignIn = () => {
    const queryClient = useQueryClient();
    return useMutation(
      (payload: { email: string; captcha: string; url?: string }) =>
        Api.signIn(payload, queryConfig),
      {
        onSuccess: () => {
          notifier?.({
            type: signInRoutine.SUCCESS,
            payload: { message: SUCCESS_MESSAGES.SIGN_IN },
          });
          queryClient.resetQueries();
        },
        onError: (error: Error) => {
          notifier?.({
            type: signInRoutine.FAILURE,
            payload: { error },
          });
        },
      },
    );
  };

  const useMobileSignIn = () => {
    const queryClient = useQueryClient();
    return useMutation(
      (payload: { email: string; captcha: string; challenge: string }) =>
        Api.mobileSignIn(payload, queryConfig),
      {
        onSuccess: () => {
          notifier?.({
            type: signInRoutine.SUCCESS,
            payload: { message: SUCCESS_MESSAGES.SIGN_IN },
          });
          queryClient.resetQueries();
        },
        onError: (error: Error) => {
          notifier?.({
            type: signInRoutine.FAILURE,
            payload: { error },
          });
        },
      },
    );
  };

  const useSignInWithPassword = () => {
    const queryClient = useQueryClient();
    return useMutation(
      (payload: {
        email: string;
        password: Password;
        captcha: string;
        url?: string;
      }) => Api.signInWithPassword(payload, queryConfig),
      {
        onSuccess: () => {
          notifier?.({
            type: signInWithPasswordRoutine.SUCCESS,
            payload: { message: SUCCESS_MESSAGES.SIGN_IN_WITH_PASSWORD },
          });
          queryClient.resetQueries();
        },
        onError: (error: Error) => {
          notifier?.({
            type: signInWithPasswordRoutine.FAILURE,
            payload: { error },
          });
        },
      },
    );
  };

  const useMobileSignInWithPassword = () => {
    const queryClient = useQueryClient();
    return useMutation(
      (payload: {
        email: string;
        password: Password;
        captcha: string;
        challenge: string;
      }) => Api.mobileSignInWithPassword(payload, queryConfig),
      {
        onSuccess: () => {
          notifier?.({
            type: signInWithPasswordRoutine.SUCCESS,
            payload: { message: SUCCESS_MESSAGES.SIGN_IN_WITH_PASSWORD },
          });
          queryClient.resetQueries();
        },
        onError: (error: Error) => {
          notifier?.({
            type: signInWithPasswordRoutine.FAILURE,
            payload: { error },
          });
        },
      },
    );
  };

  /**  mutation to update member password. suppose only you can edit yourself
   * @param {Password} password new password that user wants to set
   * @param {Password} currentPassword current password already stored
   */
  const useUpdatePassword = () =>
    useMutation(
      (payload: { password: Password; currentPassword: Password }) =>
        Api.updatePassword(payload, queryConfig),
      {
        onSuccess: () => {
          notifier?.({
            type: updatePasswordRoutine.SUCCESS,
            payload: { message: SUCCESS_MESSAGES.UPDATE_PASSWORD },
          });
        },
        onError: (error: Error) => {
          notifier?.({
            type: updatePasswordRoutine.FAILURE,
            payload: { error },
          });
        },
      },
    );

  const useSignUp = () =>
    useMutation(
      (payload: {
        name: string;
        email: string;
        captcha: string;
        url?: string;
        extra?: MemberExtra;
      }) => Api.signUp(payload, queryConfig),
      {
        onSuccess: () => {
          notifier?.({
            type: signUpRoutine.SUCCESS,
            payload: { message: SUCCESS_MESSAGES.SIGN_UP },
          });
        },
        onError: (error: Error) => {
          notifier?.({
            type: signUpRoutine.FAILURE,
            payload: { error },
          });
        },
      },
    );

  const useMobileSignUp = () =>
    useMutation(
      (payload: {
        name: string;
        email: string;
        challenge: string;
        captcha: string;
        extra?: MemberExtra;
      }) => Api.mobileSignUp(payload, queryConfig),
      {
        onSuccess: () => {
          notifier?.({
            type: signUpRoutine.SUCCESS,
            payload: { message: SUCCESS_MESSAGES.SIGN_UP },
          });
        },
        onError: (error: Error) => {
          notifier?.({
            type: signUpRoutine.FAILURE,
            payload: { error },
          });
        },
      },
    );

  const useSignOut = () => {
    const queryClient = useQueryClient();
    return useMutation((_currentMemberId?: UUID) => Api.signOut(queryConfig), {
      onSuccess: (_res, _currentMemberId) => {
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
          // todo: find a way to do something equivalent but with httpOnly cookies
          // setCurrentSession(null, queryConfig.DOMAIN);
          // removeSession(currentMemberId, queryConfig.DOMAIN);
        }
        // Update when the server confirmed the logout, instead optimistically updating the member
        // This prevents logout loop (redirect to logout -> still cookie -> logs back in)
        queryClient.setQueryData(CURRENT_MEMBER_KEY, undefined);
      },
      onError: (error: Error) => {
        notifier?.({
          type: signOutRoutine.FAILURE,
          payload: { error },
        });
      },
    });
  };

  // disable feature: session should't be store in cookie and available to js
  // queryClient.setMutationDefaults(SWITCH_MEMBER, {
  //   mutationFn: async (args: { memberId: string; domain: string }) => {
  //     // get token from stored sessions given memberId
  //     const sessions = getStoredSessions();
  //     const session = sessions?.find(
  //       ({ id: thisId }) => args.memberId === thisId,
  //     );
  //     if (!session) {
  //       throw new Error('Session is invalid');
  //     }
  //     setCurrentSession(session.token, args.domain);
  //     return args.memberId;
  //   },
  //   onSuccess: () => {
  //     notifier?.({ type: switchMemberRoutine.SUCCESS });
  //     // reset queries to take into account the new token
  //     queryClient.resetQueries();
  //   },
  //   onError: (error) => {
  //     notifier?.({
  //       type: switchMemberRoutine.FAILURE,
  //       payload: { error },
  //     });
  //   },
  // });
  // const useSwitchMember = () =>
  //   useMutation<void, unknown, { memberId: string; domain: string }>(
  //     SWITCH_MEMBER,
  //   );

  return {
    useSignIn,
    useSignInWithPassword,
    useSignOut,
    useSignUp,
    useMobileSignUp,
    useUpdatePassword,
    useMobileSignIn,
    useMobileSignInWithPassword,
  };
};

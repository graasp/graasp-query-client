import { QueryClient } from 'react-query';
import Cookies from 'js-cookie';
import { SUCCESS_MESSAGES } from '@graasp/translations';
import * as Api from '../api';
import {
  signOutRoutine,
  signInRoutine,
  signInWithPasswordRoutine,
  signUpRoutine,
} from '../routines';
import { CURRENT_MEMBER_KEY, MUTATION_KEYS } from '../config/keys';
import { QueryClientConfig } from '../types';
import { COOKIE_SESSION_NAME } from '../config/constants';

export default (queryClient: QueryClient, queryConfig: QueryClientConfig) => {
  const { notifier } = queryConfig;

  queryClient.setMutationDefaults(MUTATION_KEYS.SIGN_IN, {
    mutationFn: (payload) => Api.signIn(payload, queryConfig),
    onSuccess: () => {
      notifier?.({
        type: signInRoutine.SUCCESS,
        payload: { message: SUCCESS_MESSAGES.SIGN_IN },
      });
      queryClient.resetQueries();
    },
    onError: (error) => {
      notifier?.({ type: signInRoutine.FAILURE, payload: { error } });
    },
  });

  queryClient.setMutationDefaults(MUTATION_KEYS.SIGN_IN_WITH_PASSWORD, {
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

  queryClient.setMutationDefaults(MUTATION_KEYS.SIGN_UP, {
    mutationFn: (payload) => Api.signUp(payload, queryConfig),
    onSuccess: () => {
      notifier?.({
        type: signUpRoutine.SUCCESS,
        payload: { message: SUCCESS_MESSAGES.SIGN_UP },
      });
    },
    onError: (error) => {
      notifier?.({ type: signUpRoutine.FAILURE, payload: { error } });
    },
  });

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
    onError: (error) => {
      notifier?.({ type: signOutRoutine.FAILURE, payload: { error } });
    },
  });
};

import { QueryClient, useMutation } from 'react-query';

import * as Api from '../api';
import {
  CURRENT_CUSTOMER_KEY,
  MUTATION_KEYS,
  OWN_PLAN_KEY,
} from '../config/keys';
import {
  changePlanRoutine,
  createSetupIntentRoutine,
  setDefaultCardRoutine,
} from '../routines';
import { QueryClientConfig } from '../types';

const { SET_DEFAULT_CARD, CHANGE_PLAN, CREATE_SETUP_INTENT } = MUTATION_KEYS;

export default (queryClient: QueryClient, queryConfig: QueryClientConfig) => {
  const { notifier } = queryConfig;

  queryClient.setMutationDefaults(CHANGE_PLAN, {
    mutationFn: (payload) => Api.changePlan(payload, queryConfig),
    onSuccess: () => {
      notifier?.({ type: changePlanRoutine.SUCCESS });
    },
    onError: (error) => {
      notifier?.({ type: changePlanRoutine.FAILURE, payload: { error } });
    },
    onSettled: () => {
      queryClient.invalidateQueries(OWN_PLAN_KEY);
    },
  });
  const useChangePlan = () =>
    useMutation<void, unknown, { planId: string; cardId?: string }>(
      CHANGE_PLAN,
    );

  queryClient.setMutationDefaults(CREATE_SETUP_INTENT, {
    mutationFn: () => Api.createSetupIntent(queryConfig),
    onSuccess: () => {
      notifier?.({ type: createSetupIntentRoutine.SUCCESS });
    },
    onError: (error) => {
      notifier?.({
        type: createSetupIntentRoutine.FAILURE,
        payload: { error },
      });
    },
  });
  const useCreateSetupIntent = () =>
    useMutation<void, unknown, void>(CREATE_SETUP_INTENT);

  queryClient.setMutationDefaults(SET_DEFAULT_CARD, {
    mutationFn: (payload) => Api.setDefaultCard(payload, queryConfig),
    onSuccess: () => {
      notifier?.({ type: setDefaultCardRoutine.SUCCESS });
    },
    onError: (error) => {
      notifier?.({ type: setDefaultCardRoutine.FAILURE, payload: { error } });
    },
    onSettled: () => {
      queryClient.invalidateQueries(CURRENT_CUSTOMER_KEY);
    },
  });
  const useSetDefaultCard = () =>
    useMutation<void, unknown, { cardId: string }>(SET_DEFAULT_CARD);

  return {
    useSetDefaultCard,
    useChangePlan,
    useCreateSetupIntent,
  };
};

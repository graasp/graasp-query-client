import { QueryClient } from '@tanstack/react-query';

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

export default (queryClient: QueryClient, queryConfig: QueryClientConfig) => {
  const { notifier } = queryConfig;

  queryClient.setMutationDefaults(MUTATION_KEYS.CHANGE_PLAN, {
    mutationFn: (payload) =>
      Api.changePlan(payload, queryConfig).then(() => payload),
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

  queryClient.setMutationDefaults(MUTATION_KEYS.CREATE_SETUP_INTENT, {
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

  queryClient.setMutationDefaults(MUTATION_KEYS.SET_DEFAULT_CARD, {
    mutationFn: (payload) =>
      Api.setDefaultCard(payload, queryConfig).then(() => payload),
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
};

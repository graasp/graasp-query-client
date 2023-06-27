import { useMutation, useQueryClient } from 'react-query';

import * as Api from '../api';
import { CURRENT_CUSTOMER_KEY, OWN_PLAN_KEY } from '../config/keys';
import {
  changePlanRoutine,
  createSetupIntentRoutine,
  setDefaultCardRoutine,
} from '../routines';
import { QueryClientConfig } from '../types';

export default (queryConfig: QueryClientConfig) => {
  const { notifier } = queryConfig;

  const useChangePlan = () => {
    const queryClient = useQueryClient();
    return useMutation(
      (payload: { planId: string; cardId?: string }) =>
        Api.changePlan(payload, queryConfig),
      {
        onSuccess: () => {
          notifier?.({ type: changePlanRoutine.SUCCESS });
        },
        onError: (error: Error) => {
          notifier?.({ type: changePlanRoutine.FAILURE, payload: { error } });
        },
        onSettled: () => {
          queryClient.invalidateQueries(OWN_PLAN_KEY);
        },
      },
    );
  };

  const useCreateSetupIntent = () =>
    useMutation(() => Api.createSetupIntent(queryConfig), {
      onSuccess: () => {
        notifier?.({ type: createSetupIntentRoutine.SUCCESS });
      },
      onError: (error: Error) => {
        notifier?.({
          type: createSetupIntentRoutine.FAILURE,
          payload: { error },
        });
      },
    });

  const useSetDefaultCard = () => {
    const queryClient = useQueryClient();
    return useMutation(
      (payload: { cardId: string }) => Api.setDefaultCard(payload, queryConfig),
      {
        onSuccess: () => {
          notifier?.({ type: setDefaultCardRoutine.SUCCESS });
        },
        onError: (error: Error) => {
          notifier?.({
            type: setDefaultCardRoutine.FAILURE,
            payload: { error },
          });
        },
        onSettled: () => {
          queryClient.invalidateQueries(CURRENT_CUSTOMER_KEY);
        },
      },
    );
  };

  return {
    useSetDefaultCard,
    useChangePlan,
    useCreateSetupIntent,
  };
};

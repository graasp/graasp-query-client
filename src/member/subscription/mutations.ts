import { useMutation, useQueryClient } from '@tanstack/react-query';

import { CURRENT_CUSTOMER_KEY, memberKeys } from '../../keys.js';
import { QueryClientConfig } from '../../types.js';
import * as Api from './api.js';
import {
  changePlanRoutine,
  createSetupIntentRoutine,
  setDefaultCardRoutine,
} from './routines.js';

export default (queryConfig: QueryClientConfig) => {
  const { notifier } = queryConfig;

  const useChangePlan = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (payload: { planId: string; cardId?: string }) =>
        Api.changePlan(payload, queryConfig),
      onSuccess: () => {
        notifier?.({ type: changePlanRoutine.SUCCESS });
      },
      onError: (error: Error) => {
        notifier?.({ type: changePlanRoutine.FAILURE, payload: { error } });
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: memberKeys.current().subscription,
        });
      },
    });
  };

  const useCreateSetupIntent = () =>
    useMutation({
      mutationFn: () => Api.createSetupIntent(queryConfig),
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
    return useMutation({
      mutationFn: (payload: { cardId: string }) =>
        Api.setDefaultCard(payload, queryConfig),
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
        queryClient.invalidateQueries({ queryKey: CURRENT_CUSTOMER_KEY });
      },
    });
  };

  return {
    useSetDefaultCard,
    useChangePlan,
    useCreateSetupIntent,
  };
};

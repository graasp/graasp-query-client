import { QueryClient } from 'react-query';
import * as Api from '../api';
import { buildValidationStatusKey, MUTATION_KEYS, VALIDATION_REVIEW_KEY } from '../config/keys';
import { postItemValidationRoutine, updateItemValidationReviewRoutine } from '../routines';
import { QueryClientConfig } from '../types';

export default (queryClient: QueryClient, queryConfig: QueryClientConfig) => {
  const { notifier } = queryConfig;

  // payload: itemId
  queryClient.setMutationDefaults(MUTATION_KEYS.POST_VALIDATION, {
    mutationFn: (payload) =>
      Api.postItemValidation(payload, queryConfig).then(() => payload),
    onSuccess: () => {
      notifier?.({
        type: postItemValidationRoutine.SUCCESS,
      });
    },
    onError: (error) => {
      notifier?.({ type: postItemValidationRoutine.FAILURE, payload: { error } });
    },
    onSettled: (_data, _error, { itemId }) => {
      queryClient.invalidateQueries(buildValidationStatusKey(itemId));
    },
  });

  // payload: id (entry id), itemId, status, reason
  queryClient.setMutationDefaults(MUTATION_KEYS.UPDATE_VALIDATION_REVIEW, {
    mutationFn: (payload) => Api.updateItemValidationReview(payload, queryConfig),
    onSuccess: () => {
      notifier?.({
        type: updateItemValidationReviewRoutine.SUCCESS,
      });
    },
    onError: (error) => {
      notifier?.({
        type: updateItemValidationReviewRoutine.FAILURE,
        payload: { error },
      });
    },
    onSettled: (_data, _error, { itemId }) => {
      queryClient.invalidateQueries(buildValidationStatusKey(itemId));
      queryClient.invalidateQueries(VALIDATION_REVIEW_KEY);
    },
  });
};

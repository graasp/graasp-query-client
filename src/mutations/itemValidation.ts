import { QueryClient } from 'react-query';

import * as Api from '../api';
import {
  ITEM_VALIDATION_REVIEWS_KEY,
  MUTATION_KEYS,
  buildItemValidationAndReviewKey,
} from '../config/keys';
import {
  postItemValidationRoutine,
  updateItemValidationReviewRoutine,
} from '../routines';
import { QueryClientConfig } from '../types';

export default (queryClient: QueryClient, queryConfig: QueryClientConfig) => {
  const { notifier } = queryConfig;

  // payload: itemId
  queryClient.setMutationDefaults(MUTATION_KEYS.POST_ITEM_VALIDATION, {
    mutationFn: (payload) =>
      Api.postItemValidation(payload, queryConfig).then(() => payload),
    onSuccess: () => {
      notifier?.({
        type: postItemValidationRoutine.SUCCESS,
      });
    },
    onError: (error) => {
      notifier?.({
        type: postItemValidationRoutine.FAILURE,
        payload: { error },
      });
    },
    onSettled: (_data, _error, { itemId }) => {
      queryClient.invalidateQueries(buildItemValidationAndReviewKey(itemId));
    },
  });

  // payload: id (entry id), itemId, status, reason
  queryClient.setMutationDefaults(MUTATION_KEYS.UPDATE_ITEM_VALIDATION_REVIEW, {
    mutationFn: (payload) =>
      Api.updateItemValidationReview(payload, queryConfig),
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
      queryClient.invalidateQueries(buildItemValidationAndReviewKey(itemId));
      queryClient.invalidateQueries(ITEM_VALIDATION_REVIEWS_KEY);
    },
  });
};

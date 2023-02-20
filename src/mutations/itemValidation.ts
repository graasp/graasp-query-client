import { QueryClient, useMutation } from 'react-query';

import { UUID } from '@graasp/sdk';

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

const { UPDATE_ITEM_VALIDATION_REVIEW, POST_ITEM_VALIDATION } = MUTATION_KEYS;

export default (queryClient: QueryClient, queryConfig: QueryClientConfig) => {
  const { notifier } = queryConfig;

  // payload: itemId
  queryClient.setMutationDefaults(POST_ITEM_VALIDATION, {
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
  const usePostItemValidation = () =>
    useMutation<void, unknown, { itemId: UUID }>(POST_ITEM_VALIDATION);

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
  const useUpdateItemValidationReview = () =>
    useMutation<void, unknown, { id: UUID; status: string; reason?: string }>(
      UPDATE_ITEM_VALIDATION_REVIEW,
    );

  return {
    usePostItemValidation,
    useUpdateItemValidationReview,
  };
};

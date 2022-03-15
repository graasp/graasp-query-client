import { useQuery } from 'react-query';
import { List } from 'immutable';
import { QueryClientConfig, UUID } from '../types';
import * as Api from '../api';
import { buildItemValidationAndReviewsKey, ITEM_VALIDATION_REVIEWS_KEY, ITEM_VALIDATION_REVIEW_STATUSES_KEY, ITEM_VALIDATION_STATUSES_KEY } from '../config/keys';

export default (queryConfig: QueryClientConfig) => {
  const { retry, cacheTime, staleTime } = queryConfig;
  const defaultOptions = {
    retry,
    cacheTime,
    staleTime,
  };

  // get all entry in validation-review
  const useValidationReview = () =>
    useQuery({
      queryKey: ITEM_VALIDATION_REVIEWS_KEY,
      queryFn: () =>
        Api.getItemValidationReviews(queryConfig).then((data) => List(data)),
      ...defaultOptions,
    });

  // get all statuses
  const useItemValidationStatuses = () =>
    useQuery({
      queryKey: ITEM_VALIDATION_STATUSES_KEY,
      queryFn: () =>
        Api.getItemValidationStatuses(queryConfig).then((data) => List(data)),
      ...defaultOptions,
    });

    const useItemValidationReviewStatuses = () =>
    useQuery({
      queryKey: ITEM_VALIDATION_REVIEW_STATUSES_KEY,
      queryFn: () =>
        Api.getItemValidationReviewStatuses(queryConfig).then((data) => List(data)),
      ...defaultOptions,
    });

  // get validation joined with review records of given item
  const useItemValidationAndReviews = (itemId: UUID) =>
    useQuery({
      queryKey: buildItemValidationAndReviewsKey(itemId),
      queryFn: () =>
        Api.getValidationStatus(queryConfig, itemId).then((data) => List(data)),
      ...defaultOptions,
      enabled: Boolean(itemId),
    });

  return {
    useValidationReview,
    useItemValidationStatuses,
    useItemValidationReviewStatuses,
    useItemValidationAndReviews,
  };
};

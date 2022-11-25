import { useQuery } from '@tanstack/react-query';

import { convertJs } from '@graasp/sdk';

import * as Api from '../api';
import {
  ITEM_VALIDATION_REVIEWS_KEY,
  ITEM_VALIDATION_REVIEW_STATUSES_KEY,
  ITEM_VALIDATION_STATUSES_KEY,
  buildItemValidationAndReviewKey,
  buildItemValidationGroupsKey,
} from '../config/keys';
import { QueryClientConfig, UUID } from '../types';

export default (queryConfig: QueryClientConfig) => {
  const { defaultQueryOptions } = queryConfig;

  // get all entry in validation-review
  const useValidationReview = () =>
    useQuery({
      queryKey: ITEM_VALIDATION_REVIEWS_KEY,
      queryFn: () =>
        Api.getItemValidationReviews(queryConfig).then((data) =>
          convertJs(data),
        ),
      ...defaultQueryOptions,
    });

  // get all statuses
  const useItemValidationStatuses = () =>
    useQuery({
      queryKey: ITEM_VALIDATION_STATUSES_KEY,
      queryFn: () =>
        Api.getItemValidationStatuses(queryConfig).then((data) =>
          convertJs(data),
        ),
      ...defaultQueryOptions,
    });

  const useItemValidationReviewStatuses = () =>
    useQuery({
      queryKey: ITEM_VALIDATION_REVIEW_STATUSES_KEY,
      queryFn: () =>
        Api.getItemValidationReviewStatuses(queryConfig).then((data) =>
          convertJs(data),
        ),
      ...defaultQueryOptions,
    });

  // get last validation joined with review records of given item
  const useItemValidationAndReview = (itemId: UUID) =>
    useQuery({
      queryKey: buildItemValidationAndReviewKey(itemId),
      queryFn: () =>
        Api.getItemValidationAndReview(queryConfig, itemId).then((data) =>
          convertJs(data),
        ),
      ...defaultQueryOptions,
      enabled: Boolean(itemId),
    });

  const useItemValidationGroups = (iVId: UUID) =>
    useQuery({
      queryKey: buildItemValidationGroupsKey(iVId),
      queryFn: () =>
        Api.getItemValidationGroups(queryConfig, iVId).then((data) =>
          convertJs(data),
        ),
      ...defaultQueryOptions,
      enabled: Boolean(iVId),
    });

  return {
    useValidationReview,
    useItemValidationStatuses,
    useItemValidationReviewStatuses,
    useItemValidationAndReview,
    useItemValidationGroups,
  };
};

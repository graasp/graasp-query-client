import { useQuery } from 'react-query';
import { List } from 'immutable';
import { QueryClientConfig, UUID } from '../types';
import * as Api from '../api';
import { ALL_STATUS_KEY, buildValidationStatusKey, VALIDATION_REVIEW_KEY } from '../config/keys';

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
      queryKey: VALIDATION_REVIEW_KEY,
      queryFn: () =>
        Api.getValidationReview(queryConfig).then((data) => List(data)),
      ...defaultOptions,
    });

  // get all status
  const useAllStatus = () =>
    useQuery({
      queryKey: ALL_STATUS_KEY,
      queryFn: () =>
        Api.getStatus(queryConfig).then((data) => List(data)),
      ...defaultOptions,
    });

  // get validation status of given item
  const useValidationStatus = (itemId: UUID) =>
    useQuery({
      queryKey: buildValidationStatusKey(itemId),
      queryFn: () =>
        Api.getValidationStatus(queryConfig, itemId).then((data) => List(data)),
      ...defaultOptions,
      enabled: Boolean(itemId),
    });

  return {
    useValidationReview,
    useAllStatus,
    useValidationStatus,
  };
};

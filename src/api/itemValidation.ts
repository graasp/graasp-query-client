import { UUID } from '@graasp/sdk';

import { QueryClientConfig } from '../types';
import configureAxios, { verifyAuthentication } from './axios';
import {
  GET_ITEM_VALIDATION_REVIEWS_ROUTE,
  GET_ITEM_VALIDATION_REVIEW_STATUSES_ROUTE,
  GET_ITEM_VALIDATION_STATUSES_ROUTE,
  buildGetItemValidationAndReviewRoute,
  buildGetItemValidationGroupsRoute,
  buildGetLastItemValidationGroupRoute,
  buildPostItemValidationRoute,
  buildUpdateItemValidationReviewRoute,
} from './routes';

const axios = configureAxios();

export const getItemValidationReviews = async ({
  API_HOST,
}: QueryClientConfig) =>
  axios
    .get(`${API_HOST}/${GET_ITEM_VALIDATION_REVIEWS_ROUTE}`)
    .then(({ data }) => data);

export const getItemValidationStatuses = async ({
  API_HOST,
}: QueryClientConfig) =>
  axios
    .get(`${API_HOST}/${GET_ITEM_VALIDATION_STATUSES_ROUTE}`)
    .then(({ data }) => data);

export const getItemValidationReviewStatuses = async ({
  API_HOST,
}: QueryClientConfig) =>
  axios
    .get(`${API_HOST}/${GET_ITEM_VALIDATION_REVIEW_STATUSES_ROUTE}`)
    .then(({ data }) => data);

export const getLastItemValidationGroup = async (
  { API_HOST }: QueryClientConfig,
  itemId: UUID,
) =>
  verifyAuthentication(() =>
    axios
      .get(`${API_HOST}/${buildGetLastItemValidationGroupRoute(itemId)}`)
      .then(({ data }) => data),
  );
export const getItemValidationAndReview = async (
  { API_HOST }: QueryClientConfig,
  itemId: UUID,
) =>
  verifyAuthentication(() =>
    axios
      .get(`${API_HOST}/${buildGetItemValidationAndReviewRoute(itemId)}`)
      .then(({ data }) => data),
  );

export const getItemValidationGroups = async (
  { API_HOST }: QueryClientConfig,
  iVId: UUID,
) =>
  verifyAuthentication(() =>
    axios
      .get(`${API_HOST}/${buildGetItemValidationGroupsRoute(iVId)}`)
      .then(({ data }) => data),
  );

export const postItemValidation = async (
  { itemId }: { itemId: UUID },
  { API_HOST }: QueryClientConfig,
) =>
  verifyAuthentication(() =>
    axios
      .post(`${API_HOST}/${buildPostItemValidationRoute(itemId)}`)
      .then(({ data }) => data),
  );

// payload: status, reason ("" if not provided)
export const updateItemValidationReview = async (
  { id, status, reason }: { id: UUID; status: string; reason?: string },
  { API_HOST }: QueryClientConfig,
) =>
  verifyAuthentication(() =>
    axios
      .post(`${API_HOST}/${buildUpdateItemValidationReviewRoute(id)}`, {
        status,
        reason,
      })
      .then(({ data }) => data),
  );

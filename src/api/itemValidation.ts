import { QueryClientConfig, UUID } from '../types';
import configureAxios, {
  verifyAuthentication,
} from './axios';
import { buildGetItemValidationAndReviewsRoute, buildPostItemValidationRoute, buildUpdateItemValidationReviewRoute, GET_ITEM_VALIDATION_REVIEWS_ROUTE, GET_ITEM_VALIDATION_REVIEW_STATUSES_ROUTE, GET_ITEM_VALIDATION_STATUSES_ROUTE } from './routes';

const axios = configureAxios();

export const getItemValidationReviews = async ({ API_HOST }: QueryClientConfig) =>
  axios.get(`${API_HOST}/${GET_ITEM_VALIDATION_REVIEWS_ROUTE}`).then(({ data }) => data);

export const getItemValidationStatuses = async ({ API_HOST }: QueryClientConfig) =>
  axios.get(`${API_HOST}/${GET_ITEM_VALIDATION_STATUSES_ROUTE}`).then(({ data }) => data);

  export const getItemValidationReviewStatuses = async ({ API_HOST }: QueryClientConfig) =>
  axios.get(`${API_HOST}/${GET_ITEM_VALIDATION_REVIEW_STATUSES_ROUTE}`).then(({ data }) => data);

export const getItemValidationAndReviews = async (
  { API_HOST }: QueryClientConfig,
  itemId: UUID,
) =>
verifyAuthentication(() =>
  axios
    .get(`${API_HOST}/${buildGetItemValidationAndReviewsRoute(itemId)}`)
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
  { id, status, reason }: { id: UUID, status: string; reason?: string },
  { API_HOST }: QueryClientConfig,
) =>
  verifyAuthentication(() =>
    axios
      .post(`${API_HOST}/${buildUpdateItemValidationReviewRoute(id)}`, {
        status, reason,
      })
      .then(({ data }) => data),
  );

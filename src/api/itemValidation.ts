import { QueryClientConfig, UUID } from '../types';
import configureAxios, {
  verifyAuthentication,
} from './axios';
import { buildGetValidationStatusRoute, buildPostValidationRoute, buildUpdateValidationReviewRoute, GET_VALIDATION_REVIEW_ROUTE, GET_ALL_STATUS_ROUTE } from './routes';

const axios = configureAxios();

export const getValidationReview = async ({ API_HOST }: QueryClientConfig) =>
  axios.get(`${API_HOST}/${GET_VALIDATION_REVIEW_ROUTE}`).then(({ data }) => data);

export const getStatus = async ({ API_HOST }: QueryClientConfig) =>
  axios.get(`${API_HOST}/${GET_ALL_STATUS_ROUTE}`).then(({ data }) => data);

export const getValidationStatus = async (
  { API_HOST }: QueryClientConfig,
  itemId: UUID,
) =>
verifyAuthentication(() =>
  axios
    .get(`${API_HOST}/${buildGetValidationStatusRoute(itemId)}`)
    .then(({ data }) => data),
  );

export const postItemValidation = async (
  { itemId }: { itemId: UUID },
  { API_HOST }: QueryClientConfig,
) =>
  verifyAuthentication(() =>
    axios
      .post(`${API_HOST}/${buildPostValidationRoute(itemId)}`)
      .then(({ data }) => data),
  );

// payload: status, reason ("" if not provided)
export const updateItemValidationReview = async (
  { id, status, reason }: { id: UUID, status: string; reason: string },
  { API_HOST }: QueryClientConfig,
) =>
  verifyAuthentication(() =>
    axios
      .post(`${API_HOST}/${buildUpdateValidationReviewRoute(id)}`, {
        status, reason,
      })
      .then(({ data }) => data),
  );

import axios from 'axios';
import { QueryClientConfig, UUID } from '../types';
import { buildPostItemFlagRoute, GET_FLAGS_ROUTE } from './routes';

export const getFlags = async ({ API_HOST }: QueryClientConfig) =>
  axios
    .get(`${API_HOST}/${GET_FLAGS_ROUTE}`, {
      withCredentials: true,
    })
    .then(({ data }) => data);

// payload: flagId, itemId
export const postItemFlag = async (
  { flagId, itemId }: { flagId: UUID; itemId: string },
  { API_HOST }: QueryClientConfig,
) =>
  axios
    .post(`${API_HOST}/${buildPostItemFlagRoute(itemId)}`, {
      flagId,
      withCredentials: true,
    })
    .then(({ data }) => data);

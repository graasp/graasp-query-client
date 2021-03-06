import { QueryClientConfig, UUID } from '../types';
import configureAxios, { verifyAuthentication } from './axios';
import { buildPostItemFlagRoute, GET_FLAGS_ROUTE } from './routes';

const axios = configureAxios();

export const getFlags = async ({ API_HOST }: QueryClientConfig) =>
  verifyAuthentication(() =>
    axios.get(`${API_HOST}/${GET_FLAGS_ROUTE}`).then(({ data }) => data),
  );

// payload: flagId, itemId
export const postItemFlag = async (
  { flagId, itemId }: { flagId: UUID; itemId: string },
  { API_HOST }: QueryClientConfig,
) =>
  verifyAuthentication(() =>
    axios
      .post(`${API_HOST}/${buildPostItemFlagRoute(itemId)}`, {
        flagId,
      })
      .then(({ data }) => data),
  );

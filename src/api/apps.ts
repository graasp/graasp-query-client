import { App, UUID } from '@graasp/sdk';

import { QueryClientConfig } from '../types';
import configureAxios, { verifyAuthentication } from './axios';
import { buildAppListRoute, buildGetApiAccessTokenRoute } from './routes';

const axios = configureAxios();

export const getApps = async ({
  API_HOST,
}: Pick<QueryClientConfig, 'API_HOST'>): Promise<App[]> =>
  verifyAuthentication(() =>
    axios.get(`${API_HOST}/${buildAppListRoute}`).then(({ data }) => data),
  );

export const requestApiAccessToken = async (
  args: { id: UUID; key: string; origin: string },
  { API_HOST }: Pick<QueryClientConfig, 'API_HOST'>,
): Promise<{ token: string }> => {
  const { id, key, origin } = args;
  return axios
    .post(`${API_HOST}/${buildGetApiAccessTokenRoute(id)}`, {
      origin,
      key,
    })
    .then(({ data }) => data);
};

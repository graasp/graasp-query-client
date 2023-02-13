import { UUID } from '@graasp/sdk';
import { App } from '@graasp/sdk/frontend';

import { QueryClientConfig } from '../types';
import configureAxios, {
  fallbackToPublic,
  verifyAuthentication,
} from './axios';
import {
  buildAppListRoute,
  buildGetApiAccessTokenRoute,
  buildGetPublicApiAccessTokenRoute,
} from './routes';

const axios = configureAxios();

export const getApps = async ({
  API_HOST,
}: QueryClientConfig): Promise<App[]> =>
  verifyAuthentication(() =>
    axios.get(`${API_HOST}/${buildAppListRoute}`).then(({ data }) => data),
  );

export const requestApiAccessToken = async (
  args: { id: UUID; app: string; origin: string },
  { API_HOST }: QueryClientConfig,
): Promise<{ token: string }> => {
  const { id, app, origin } = args;
  return fallbackToPublic(
    () =>
      axios.post(`${API_HOST}/${buildGetApiAccessTokenRoute(id)}`, {
        origin,
        app,
      }),
    () =>
      axios.post(`${API_HOST}/${buildGetPublicApiAccessTokenRoute(id)}`, {
        origin,
        app,
      }),
  );
};

import {
  buildAppListRoute,
  buildGetApiAccessTokenRoute,
  buildGetPublicApiAccessTokenRoute,
} from './routes';
import { QueryClientConfig, UUID } from '../types';
import configureAxios, {
  fallbackToPublic,
  verifyAuthentication,
} from './axios';

const axios = configureAxios();

export const getApps = async ({ API_HOST }: QueryClientConfig) =>
  verifyAuthentication(() =>
    axios.get(`${API_HOST}/${buildAppListRoute}`).then(({ data }) => data),
  );

export const requestApiAccessToken = async (
  args: { id: UUID; app: string; origin: string },
  { API_HOST }: QueryClientConfig,
) => {
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

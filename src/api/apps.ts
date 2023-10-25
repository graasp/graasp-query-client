import { App, UUID } from '@graasp/sdk';

import { PartialQueryConfigForApi } from '../types';
import { verifyAuthentication } from './axios';
import { buildAppListRoute, buildGetApiAccessTokenRoute } from './routes';

export const getApps = async ({
  API_HOST,
  axios,
}: PartialQueryConfigForApi): Promise<App[]> =>
  verifyAuthentication(() =>
    axios.get(`${API_HOST}/${buildAppListRoute}`).then(({ data }) => data),
  );

export const requestApiAccessToken = async (
  args: {
    id: UUID;
    key: string;
    origin: string;
    /** @deprecated use key instead */
    app?: string;
  },
  { API_HOST, axios }: PartialQueryConfigForApi,
): Promise<{ token: string }> => {
  const { id, key, origin, app } = args;
  return axios
    .post(`${API_HOST}/${buildGetApiAccessTokenRoute(id)}`, {
      origin,
      key: key ?? app,
    })
    .then(({ data }) => data);
};

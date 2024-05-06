import { App, UUID } from '@graasp/sdk';

import { PartialQueryConfigForApi } from '../types.js';
import { verifyAuthentication } from './axios.js';
import {
  buildAppListRoute,
  buildGetApiAccessTokenRoute,
  buildMostUsedAppListRoute,
} from './routes.js';

export const getApps = async ({ API_HOST, axios }: PartialQueryConfigForApi) =>
  verifyAuthentication(() =>
    axios
      .get<App[]>(`${API_HOST}/${buildAppListRoute}`)
      .then(({ data }) => data),
  );

export const getMostUsedApps = async (
  memberId: UUID,
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  verifyAuthentication(() =>
    axios
      .get<
        { url: string; name: string; nbr: number }[]
      >(`${API_HOST}/${buildMostUsedAppListRoute(memberId)}`)
      .then(({ data }) => data),
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
) => {
  const { id, key, origin, app } = args;
  return axios
    .post<{ token: string }>(`${API_HOST}/${buildGetApiAccessTokenRoute(id)}`, {
      origin,
      key: key ?? app,
    })
    .then(({ data }) => data);
};

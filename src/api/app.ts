import { QueryClientConfig, UUID } from '../types';
import { buildItemAppApiAccessTokenRoute } from './routes';
import { DEFAULT_POST, failOnError } from './utils';

type PayloadType = { id: UUID; origin: string; app: string };

// eslint-disable-next-line import/prefer-default-export
export const requestApiAccessToken = async (
  { id, origin, app }: PayloadType,
  { API_HOST }: QueryClientConfig,
) => {
  const requestInit: RequestInit = {
    ...DEFAULT_POST,
    body: JSON.stringify({ origin, app }),
  };

  const res = await fetch(
    `${API_HOST}/${buildItemAppApiAccessTokenRoute(id)}`,
    requestInit,
  ).then(failOnError);

  return res.json();
};

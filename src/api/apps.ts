import { failOnError, DEFAULT_GET } from './utils';
import { buildAppListRoute } from './routes';
import { QueryClientConfig } from '../types';

// eslint-disable-next-line import/prefer-default-export
export const getApps = async ({ API_HOST }: QueryClientConfig) => {
  const res = await fetch(`${API_HOST}/${buildAppListRoute}`, DEFAULT_GET).then(
    failOnError,
  );

  return res.json();
};

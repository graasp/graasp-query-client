import { QueryClientConfig } from '../types';
import { SIGN_OUT_ROUTE } from './routes';
import { DEFAULT_GET, failOnError } from './utils';

// eslint-disable-next-line import/prefer-default-export
export const signOut = ({ API_HOST }: QueryClientConfig) =>
  fetch(`${API_HOST}/${SIGN_OUT_ROUTE}`, DEFAULT_GET)
    .then(failOnError)
    .then(({ ok }) => ok);

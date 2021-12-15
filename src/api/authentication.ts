import { QueryClientConfig } from '../types';
import configureAxios, { verifyAuthentication } from './axios';
import { SIGN_OUT_ROUTE } from './routes';

const axios = configureAxios();

// eslint-disable-next-line import/prefer-default-export
export const signOut = ({ API_HOST }: QueryClientConfig) =>
  verifyAuthentication(() =>
    axios.get(`${API_HOST}/${SIGN_OUT_ROUTE}`).then(({ data }) => data),
  );

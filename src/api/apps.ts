import { buildAppListRoute } from './routes';
import { QueryClientConfig } from '../types';
import configureAxios, { verifyAuthentication } from './axios';

const axios = configureAxios();

// eslint-disable-next-line import/prefer-default-export
export const getApps = async ({ API_HOST }: QueryClientConfig) =>
  verifyAuthentication(() =>
    axios.get(`${API_HOST}/${buildAppListRoute}`).then(({ data }) => data),
  );

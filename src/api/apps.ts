import axios from 'axios';
import { buildAppListRoute } from './routes';
import { QueryClientConfig } from '../types';

// eslint-disable-next-line import/prefer-default-export
export const getApps = async ({ API_HOST }: QueryClientConfig) =>
  axios
    .get(`${API_HOST}/${buildAppListRoute}`, {
      withCredentials: true,
    })
    .then(({ data }) => data);

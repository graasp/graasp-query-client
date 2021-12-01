import axios from 'axios';
import { QueryClientConfig } from '../types';
import { SIGN_OUT_ROUTE } from './routes';

// eslint-disable-next-line import/prefer-default-export
export const signOut = ({ API_HOST }: QueryClientConfig) =>
  axios
    .get(`${API_HOST}/${SIGN_OUT_ROUTE}`, {
      withCredentials: true,
    })
    .then(({ data }) => data);

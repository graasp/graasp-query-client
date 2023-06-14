import { Password } from '@graasp/sdk/frontend';

import { QueryClientConfig } from '../types';
import configureAxios, { verifyAuthentication } from './axios';
import {
  SIGN_IN_ROUTE,
  SIGN_IN_WITH_PASSWORD_ROUTE,
  SIGN_OUT_ROUTE,
  SIGN_UP_ROUTE,
} from './routes';

const axios = configureAxios();

export const signOut = ({ API_HOST }: QueryClientConfig) =>
  verifyAuthentication(() =>
    axios.get(`${API_HOST}/${SIGN_OUT_ROUTE}`).then(({ data }) => data),
  );

export const signIn = async (
  payload: { email: string },
  { API_HOST }: QueryClientConfig,
) => axios.post(`${API_HOST}/${SIGN_IN_ROUTE}`, payload);

export const signInWithPassword = async (
  payload: { email: string; password: Password },
  { API_HOST }: QueryClientConfig,
) =>
  axios
    .post(`${API_HOST}/${SIGN_IN_WITH_PASSWORD_ROUTE}`, payload)
    .then((d) => {
      console.log(d);
      return d.data;
    })
    .catch((error) => {
      if (error.response.status >= 200 && error.response.status < 400) {
        console.log(error.response);
        return error.response.data;
      }

      throw error;
    });

export const signUp = async (
  payload: { name: string; email: string },
  { API_HOST }: QueryClientConfig,
) => axios.post(`${API_HOST}/${SIGN_UP_ROUTE}`, payload);

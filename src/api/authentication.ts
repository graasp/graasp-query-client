import { HttpMethod } from '@graasp/sdk';

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
  payload: { email: string; password: string },
  { API_HOST }: QueryClientConfig,
) =>
  axios({
    method: HttpMethod.POST,
    url: `${API_HOST}/${SIGN_IN_WITH_PASSWORD_ROUTE}`,
    data: payload,
    // Resolve only if the status code is less than 500
    validateStatus: (status) => status >= 200 && status < 400,
  });

export const signUp = async (
  payload: { name: string; email: string },
  { API_HOST }: QueryClientConfig,
) => axios.post(`${API_HOST}/${SIGN_UP_ROUTE}`, payload);

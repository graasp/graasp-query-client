import { QueryClientConfig } from '../types';
import configureAxios, { verifyAuthentication } from './axios';
import { SIGN_OUT_ROUTE } from './routes';

const axios = configureAxios();

export const signOut = ({ API_HOST }: QueryClientConfig) =>
  verifyAuthentication(() =>
    axios.get(`${API_HOST}/${SIGN_OUT_ROUTE}`).then(({ data }) => data),
  );

export const signIn = async (
  payload: { email: string },
  { API_HOST }: QueryClientConfig,
) => axios.post(`${API_HOST}/login`, payload);

export const signInPassword = async (
  payload: { email: string; password: string },
  { API_HOST }: QueryClientConfig,
) => axios.post(`${API_HOST}/login-password`, payload);

export const signUp = async (
  payload: { name: string; email: string },
  { API_HOST }: QueryClientConfig,
) => axios.post(`${API_HOST}/register`, payload);

import { HttpMethod } from '@graasp/sdk';
import { Password } from '@graasp/sdk/frontend';

import { PartialQueryConfigForApi } from '../types';
import { verifyAuthentication } from './axios';
import {
  MOBILE_SIGN_IN_ROUTE,
  MOBILE_SIGN_IN_WITH_PASSWORD_ROUTE,
  MOBILE_SIGN_UP_ROUTE,
  SIGN_IN_ROUTE,
  SIGN_IN_WITH_PASSWORD_ROUTE,
  SIGN_OUT_ROUTE,
  SIGN_UP_ROUTE,
} from './routes';

export const signOut = ({
  API_HOST,
  axios,
}: PartialQueryConfigForApi): Promise<void> =>
  verifyAuthentication(() =>
    axios.get(`${API_HOST}/${SIGN_OUT_ROUTE}`).then(({ data }) => data),
  );

export const signIn = async (
  payload: { email: string; captcha: string; url?: string },
  { API_HOST, axios }: PartialQueryConfigForApi,
): Promise<void> => axios.post(`${API_HOST}/${SIGN_IN_ROUTE}`, payload);

export const mobileSignIn = async (
  payload: { email: string; challenge: string; captcha: string },
  { API_HOST, axios }: PartialQueryConfigForApi,
): Promise<void> => axios.post(`${API_HOST}/${MOBILE_SIGN_IN_ROUTE}`, payload);

export const signInWithPassword = async (
  payload: { email: string; password: Password; captcha: string; url?: string },
  { API_HOST, axios }: PartialQueryConfigForApi,
): Promise<{ resource: string }> =>
  axios({
    method: HttpMethod.POST,
    url: `${API_HOST}/${SIGN_IN_WITH_PASSWORD_ROUTE}`,
    data: payload,
    // Resolve only if the status code is less than 500
    validateStatus: (status) => status >= 200 && status < 400,
  }).then(({ data }) => data);

export const mobileSignInWithPassword = async (
  payload: {
    email: string;
    password: Password;
    challenge: string;
    captcha: string;
  },
  { API_HOST, axios }: PartialQueryConfigForApi,
): Promise<{ resource: string }> =>
  axios
    .post(`${API_HOST}/${MOBILE_SIGN_IN_WITH_PASSWORD_ROUTE}`, payload, {
      // Resolve only if the status code is less than 500
      validateStatus: (status) => status >= 200 && status < 400,
    })
    .then(({ data }) => data);

export const signUp = async (
  payload: { name: string; email: string; captcha: string; url?: string },
  { API_HOST, axios }: PartialQueryConfigForApi,
): Promise<void> => axios.post(`${API_HOST}/${SIGN_UP_ROUTE}`, payload);

export const mobileSignUp = async (
  payload: { name: string; email: string; challenge: string; captcha: string },
  { API_HOST, axios }: PartialQueryConfigForApi,
): Promise<void> => axios.post(`${API_HOST}/${MOBILE_SIGN_UP_ROUTE}`, payload);

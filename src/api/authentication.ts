import { Password } from '@graasp/sdk';

import {
  MOBILE_SIGN_IN_ROUTE,
  MOBILE_SIGN_IN_WITH_PASSWORD_ROUTE,
  MOBILE_SIGN_UP_ROUTE,
  SIGN_IN_ROUTE,
  SIGN_IN_WITH_PASSWORD_ROUTE,
  SIGN_OUT_ROUTE,
  SIGN_UP_ROUTE,
} from '../routes.js';
import { PartialQueryConfigForApi } from '../types.js';
import { verifyAuthentication } from './axios.js';

export const signOut = ({ API_HOST, axios }: PartialQueryConfigForApi) =>
  verifyAuthentication(() =>
    axios.get<void>(`${API_HOST}/${SIGN_OUT_ROUTE}`).then(({ data }) => data),
  );

export const signIn = async (
  payload: { email: string; captcha: string; url?: string },
  { API_HOST, axios }: PartialQueryConfigForApi,
) => axios.post<void>(`${API_HOST}/${SIGN_IN_ROUTE}`, payload);

export const mobileSignIn = async (
  payload: { email: string; challenge: string; captcha: string },
  { API_HOST, axios }: PartialQueryConfigForApi,
) => axios.post<void>(`${API_HOST}/${MOBILE_SIGN_IN_ROUTE}`, payload);

export const signInWithPassword = async (
  payload: { email: string; password: Password; captcha: string; url?: string },
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  axios
    .post<{ resource: string }>(
      `${API_HOST}/${SIGN_IN_WITH_PASSWORD_ROUTE}`,
      payload,
      {
        data: payload,
        // Resolve only if the status code is less than 500
        validateStatus: (status: number) => status >= 200 && status < 400,
      },
    )
    .then(({ data }) => data);

export const mobileSignInWithPassword = async (
  payload: {
    email: string;
    password: Password;
    challenge: string;
    captcha: string;
  },
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  axios
    .post<{ resource: string }>(
      `${API_HOST}/${MOBILE_SIGN_IN_WITH_PASSWORD_ROUTE}`,
      payload,
      {
        // Resolve only if the status code is less than 500
        validateStatus: (status) => status >= 200 && status < 400,
      },
    )
    .then(({ data }) => data);

export const signUp = async (
  payload: {
    name: string;
    email: string;
    captcha: string;
    url?: string;
    enableSaveActions: boolean;
  },
  { API_HOST, axios }: PartialQueryConfigForApi,
  query: { lang?: string },
) => {
  const url = new URL(SIGN_UP_ROUTE, API_HOST);
  const { lang } = query;
  if (lang) {
    url.searchParams.set('lang', lang);
  }
  return axios.post<void>(url.toString(), payload);
};

export const mobileSignUp = async (
  payload: {
    name: string;
    email: string;
    challenge: string;
    captcha: string;
    enableSaveActions: boolean;
  },
  { API_HOST, axios }: PartialQueryConfigForApi,
  query: { lang?: string },
) => {
  const url = new URL(MOBILE_SIGN_UP_ROUTE, API_HOST);
  const { lang } = query;
  if (lang) {
    url.searchParams.set('lang', lang);
  }
  return axios.post<void>(url.toString(), payload);
};

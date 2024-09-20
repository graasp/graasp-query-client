import { Password } from '@graasp/sdk';

import {
  MOBILE_SIGN_IN_ROUTE,
  MOBILE_SIGN_IN_WITH_PASSWORD_ROUTE,
  MOBILE_SIGN_UP_ROUTE,
  PASSWORD_RESET_REQUEST_ROUTE,
  SIGN_IN_ROUTE,
  SIGN_IN_WITH_PASSWORD_ROUTE,
  SIGN_OUT_ROUTE,
  SIGN_UP_ROUTE,
} from '../routes.js';
import { PartialQueryConfigForApi } from '../types.js';
import { verifyAuthentication } from './axios.js';

export const signOut = ({ API_HOST, axios }: PartialQueryConfigForApi) =>
  verifyAuthentication(() => {
    const url = new URL(SIGN_OUT_ROUTE, API_HOST);
    return axios.get<void>(url.toString()).then(({ data }) => data);
  });

export const signIn = async (
  payload: { email: string; captcha: string; url?: string },
  { API_HOST, axios }: PartialQueryConfigForApi,
) => {
  const url = new URL(SIGN_IN_ROUTE, API_HOST);
  return axios.post<void>(url.toString(), payload);
};

export const mobileSignIn = async (
  payload: { email: string; challenge: string; captcha: string },
  { API_HOST, axios }: PartialQueryConfigForApi,
) => {
  const url = new URL(MOBILE_SIGN_IN_ROUTE, API_HOST);
  return axios.post<void>(url.toString(), payload);
};

export const signInWithPassword = async (
  payload: { email: string; password: Password; captcha: string; url?: string },
  { API_HOST, axios }: PartialQueryConfigForApi,
) => {
  const url = new URL(SIGN_IN_WITH_PASSWORD_ROUTE, API_HOST);
  return axios
    .post<{ resource: string }>(url.toString(), payload, {
      data: payload,
      // Resolve only if the status code is less than 400
      validateStatus: (status: number) => status >= 200 && status < 400,
    })
    .then(({ data }) => data);
};

export const mobileSignInWithPassword = async (
  payload: {
    email: string;
    password: Password;
    challenge: string;
    captcha: string;
  },
  { API_HOST, axios }: PartialQueryConfigForApi,
) => {
  const url = new URL(MOBILE_SIGN_IN_WITH_PASSWORD_ROUTE, API_HOST);
  return axios
    .post<{ resource: string }>(url.toString(), payload, {
      // Resolve only if the status code is less than 400
      validateStatus: (status) => status >= 200 && status < 400,
    })
    .then(({ data }) => data);
};

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

export const createPasswordResetRequest = async (
  payload: {
    email: string;
    captcha: string;
  },
  { API_HOST, axios }: PartialQueryConfigForApi,
) => {
  const url = new URL(PASSWORD_RESET_REQUEST_ROUTE, API_HOST);
  return axios.post<void>(url.toString(), payload).then(({ data }) => data);
};

export const resolvePasswordResetRequest = async (
  payload: {
    password: string;
    token: string;
  },
  { API_HOST, axios }: PartialQueryConfigForApi,
) => {
  const url = new URL(PASSWORD_RESET_REQUEST_ROUTE, API_HOST);
  return axios
    .patch<void>(
      url.toString(),
      { password: payload.password },
      { headers: { Authorization: `Bearer ${payload.token}` } },
    )
    .then(({ data }) => data);
};

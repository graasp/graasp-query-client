import axios, { AxiosResponse } from 'axios';
import { isUserAuthenticated } from './utils';
import { FALLBACK_TO_PUBLIC_FOR_STATUS_CODES } from '../config/constants';
import { UserIsSignedOut } from '../config/errors';

const configureAxios = () => {
  axios.defaults.withCredentials = true;
  return axios;
};

export const verifyAuthentication = (
  request: () => Promise<AxiosResponse>,
  returnValue?: any,
) => {
  if (!isUserAuthenticated()) {
    if (returnValue) {
      return returnValue;
    }

    throw new UserIsSignedOut();
  }

  return request();
};

const returnFallbackDataOrThrow = (error: Error, fallbackData: unknown) => {
  if (fallbackData) {
    return fallbackData;
  }

  throw error;
};

/**
 * Automatically send request depending on whether member is authenticated
 * The function fallback to public depending on status code or authentication
 * @param request private axios request
 * @param publicRequest public axios request
 * @returns private request response, or public request response
 */
export const fallbackToPublic = (
  request: () => Promise<AxiosResponse>,
  publicRequest: () => Promise<AxiosResponse>,
  fallbackData?: unknown,
) => {
  const isAuthenticated = isUserAuthenticated();

  if (!isAuthenticated) {
    return publicRequest()
      .then(({ data }) => data)
      .catch((e) => returnFallbackDataOrThrow(e, fallbackData));
  }

  return request()
    .then(({ data }) => data)
    .catch((error) => {
      if (FALLBACK_TO_PUBLIC_FOR_STATUS_CODES.includes(error.response.status)) {
        return publicRequest()
          .then(({ data }) => data)
          .catch((e) => returnFallbackDataOrThrow(e, fallbackData));
      }

      return returnFallbackDataOrThrow(error, fallbackData);
    });
};

export default configureAxios;

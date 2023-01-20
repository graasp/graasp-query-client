import axios, { AxiosError, AxiosResponse } from 'axios';

import { convertJs, isUserAuthenticated, spliceIntoChunks } from '@graasp/sdk';

import { FALLBACK_TO_PUBLIC_FOR_STATUS_CODES } from '../config/constants';
import { UserIsSignedOut } from '../config/errors';
import { isObject } from '../utils/util';

const configureAxios = () => {
  axios.defaults.withCredentials = true;

  return axios;
};

export function verifyAuthentication<R>(request: () => R, returnValue?: R) {
  if (!isUserAuthenticated()) {
    if (returnValue) {
      return returnValue;
    }
    throw new UserIsSignedOut();
  }

  return request();
}

const returnFallbackDataOrThrow = (error: Error, fallbackData: unknown) => {
  if (fallbackData) {
    return fallbackData;
  }

  throw error;
};

const fallbackForArray = async (
  data: unknown,
  publicRequest: () => Promise<AxiosResponse>,
) => {
  // the array contains an error
  if (
    Array.isArray(data) &&
    data.some((d) =>
      FALLBACK_TO_PUBLIC_FOR_STATUS_CODES.includes(d?.statusCode),
    )
  ) {
    const publicCall = await publicRequest();
    const { data: publicData } = publicCall;

    // merge private and public valid data
    const finalData = data.map((d, idx) =>
      d?.statusCode ? publicData[idx] : d,
    );
    return finalData;
  }
  return data;
};

export type FallbackToPublicOptions = {
  public?: boolean;
  fallbackData?: unknown;
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
  options?: FallbackToPublicOptions,
) => {
  let isAuthenticated;

  // if the call should be public, override isAuthenticated
  if (options?.public) {
    isAuthenticated = false;
  } else {
    isAuthenticated = isUserAuthenticated();
  }

  if (!isAuthenticated) {
    return publicRequest()
      .then(({ data }) => data)
      .catch((e) => returnFallbackDataOrThrow(e, options?.fallbackData));
  }

  return request()
    .then(({ data }) => fallbackForArray(data, publicRequest))
    .catch((error) => {
      if (
        FALLBACK_TO_PUBLIC_FOR_STATUS_CODES.includes(error.response?.status)
      ) {
        return publicRequest()
          .then(({ data }) => data)
          .catch((e) => returnFallbackDataOrThrow(e, options?.fallbackData));
      }

      return returnFallbackDataOrThrow(error, options?.fallbackData);
    });
};

// this function is used to purposely trigger an error for react-query
// especially when the request returns positively with an array of errors (ie: copy many items)
export const throwIfArrayContainsErrorOrReturn = (array: any[]) => {
  const errors = array?.filter((value) => isObject(value) && value.statusCode);
  if (errors.length) {
    // assume all errors are the same
    // build axios error from error data received
    const error = {
      response: { data: errors[0] },
    } as AxiosError;
    throw error;
  }
  return array;
};

export default configureAxios;

/**
 * Split a given request in multiple smallest requests, so it conforms to the backend limitations
 * The response is parsed to detect errors, and is transformed into a deep immutable data
 * @param {string[]} ids elements' id
 * @param {number} chunkSize maximum number of ids par request
 * @param {function} buildRequest builder for the request given the chunk ids
 * @param {boolean} [ignoreErrors=false] whether we ignore errors
 * @returns {Promise} all requests returning their data merged
 */
export const splitRequestByIds = (
  ids: string[],
  chunkSize: number,
  buildRequest: (ids: string[]) => Promise<any>,
  ignoreErrors = false,
) => {
  const shunkedIds = spliceIntoChunks(ids, chunkSize);
  return Promise.all(
    shunkedIds.map((groupedIds) => buildRequest(groupedIds)),
  ).then((responses) => {
    const result = responses.flat();
    if (!ignoreErrors) {
      throwIfArrayContainsErrorOrReturn(result);
    }
    return convertJs(result);
  });
};

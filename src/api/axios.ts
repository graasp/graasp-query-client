import axios, { AxiosError, AxiosResponse } from 'axios';

import {
  ResultOf,
  convertJs,
  parseStringToDate,
  spliceIntoChunks,
} from '@graasp/sdk';
import { ResultOfRecord } from '@graasp/sdk/frontend';

const configureAxios = () => {
  axios.defaults.withCredentials = true;
  axios.defaults.transformResponse = [
    (data) => {
      try {
        const content = JSON.parse(data);
        return parseStringToDate(content);
      } catch (e) {
        // the data was a normal string and we return it
        return data;
      }
    },
  ];

  return axios;
};

export function verifyAuthentication<R>(request: () => R) {
  // change: we cannot check if user is authenticated from cookie since it is httpOnly
  // if (!isUserAuthenticated()) {
  //   if (returnValue) {
  //     return returnValue;
  //   }
  //   throw new UserIsSignedOut();
  // }

  return request();
}

// this function is used to purposely trigger an error for react-query
// especially when the request returns positively with an array of errors (ie: copy many items)
export const throwIfArrayContainsErrorOrReturn = (data: ResultOf<any>) => {
  const { errors } = data;
  if (errors?.length) {
    // assume all errors are the same
    // build axios error from error data received
    const error = {
      response: { data: errors },
    } as AxiosError;
    throw error;
  }
  return data;
};

export default configureAxios;

/**
 * Split a given request in multiple smallest requests, so it conforms to the backend limitations
 * The response is parsed to detect errors, and is transformed into a deep immutable data
 * @param {string[]} ids elements' id
 * @param {number} chunkSize maximum number of ids per request
 * @param {function} buildRequest builder for the request given the chunk ids
 * @param {boolean} [ignoreErrors=false] whether we ignore errors
 * @returns {Promise} all requests returning their data merged
 */
export const splitRequestByIds = <T>(
  ids: string[],
  chunkSize: number,
  buildRequest: (ids: string[]) => Promise<ResultOf<T>>,
  ignoreErrors = false,
): Promise<ResultOfRecord<T>> => {
  const shunkedIds = spliceIntoChunks(ids, chunkSize);
  return Promise.all(
    shunkedIds.map((groupedIds) => buildRequest(groupedIds)),
  ).then((responses) => {
    // only get request returns
    // todo: not ideal..
    if (responses.every((r: any) => !r?.data)) {
      return null;
    }

    const result = responses.reduce(
      (prev, d) => ({
        data: { ...prev.data, ...(d.data ?? {}) },
        errors: prev.errors.concat(d.errors),
      }),
      { data: {}, errors: [] },
    );

    if (!ignoreErrors) {
      throwIfArrayContainsErrorOrReturn(result);
    }
    return convertJs(result);
  });
};

/**
 * Split a given request in multiple smallest requests, so it conforms to the backend limitations
 * The endpoint returns empty result, so do the splitted requests
 * @param {string[]} ids elements' id
 * @param {number} chunkSize maximum number of ids per request
 * @param {function} buildRequest builder for the request given the chunk ids
 * @param {boolean} [ignoreErrors=false] whether we ignore errors
 * @returns {Promise} all requests returning their data merged
 */
export const splitAsyncRequestByIds = (
  ids: string[],
  chunkSize: number,
  buildRequest: (ids: string[]) => Promise<AxiosResponse<any, any>>,
) => {
  const shunkedIds = spliceIntoChunks(ids, chunkSize);
  return Promise.all(shunkedIds.map((groupedIds) => buildRequest(groupedIds)));
};

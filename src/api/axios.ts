import { ResultOf, spliceIntoChunks } from '@graasp/sdk';

import axios, { AxiosError } from 'axios';

const configureAxios = () => {
  axios.defaults.withCredentials = true;

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
export const throwIfArrayContainsErrorOrReturn = (data: ResultOf<unknown>) => {
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
 * @param {string[]} ids elements' id
 * @param {number} chunkSize maximum number of ids per request
 * @param {function} buildRequest builder for the request given the chunk ids
 */
export const splitRequestByIds = async <T>(
  ids: string[],
  chunkSize: number,
  buildRequest: (ids: string[]) => Promise<ResultOf<T> | void>,
) => {
  const chunkedIds = spliceIntoChunks(ids, chunkSize)
    // filter out empty arrays
    .filter((arr) => arr.length);

  return Promise.all(chunkedIds.map((groupedIds) => buildRequest(groupedIds)));
};

/**
 * Split a given request in multiple smallest requests, so it conforms to the backend limitations
 * The response is parsed to detect errors, and is transformed into a deep data
 * @param {string[]} ids elements' id
 * @param {number} chunkSize maximum number of ids per request
 * @param {function} buildRequest builder for the request given the chunk ids
 * @param {boolean} [ignoreErrors=false] whether we ignore errors
 * @returns {Promise} all requests returning their data merged
 */
export const splitRequestByIdsAndReturn = <T>(
  ids: string[],
  chunkSize: number,
  buildRequest: (ids: string[]) => Promise<ResultOf<T> | void>,
  ignoreErrors = false,
): Promise<ResultOf<T>> =>
  splitRequestByIds(ids, chunkSize, buildRequest).then((responses) => {
    // only get request returns
    // todo: not ideal..
    if (responses.every((r) => !r?.data)) {
      throw new Error('responses is empty');
    }

    const result = (responses as ResultOf<T>[]).reduce(
      (prev, d) => ({
        data: { ...prev.data, ...(d.data ?? {}) },
        errors: d.errors ? prev.errors.concat(d.errors) : prev.errors,
      }),
      { data: {}, errors: [] },
    );

    if (!ignoreErrors) {
      throwIfArrayContainsErrorOrReturn(result);
    }
    return result;
  });

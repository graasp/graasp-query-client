import axios, { AxiosResponse } from 'axios';
import { isUserAuthenticated } from './utils';
import { FALLBACK_TO_PUBLIC_FOR_STATUS_CODES } from '../config/constants';
import { UserIsSignedOut } from '../config/errors';

const configureAxios = () => {
  axios.defaults.withCredentials = true;

  // axios.interceptors.request.use((config) => {

  //     // preventive throw for private endpoints
  //     if (!config?.url?.includes('/p/') && !isUserAuthenticated()) {
  //         // return Promise.reject(new Error('User is not authenticated'));

  //         throw new Error('User is not authenticated')
  //     }

  //     return config;
  // }, (e) => {
  //     console.log(e)
  //     return Promise.reject(e);
  // });

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

export const fallbackToPublic = (
  request: () => Promise<AxiosResponse>,
  publicRequest: () => Promise<AxiosResponse>,
) => {
  const isAuthenticated = isUserAuthenticated();

  if (!isAuthenticated) {
    return publicRequest().then(({ data }) => data);
  }

  return request()
    .then(({ data }) => data)
    .catch((error) => {
      if (FALLBACK_TO_PUBLIC_FOR_STATUS_CODES.includes(error.response.status)) {
        return publicRequest().then(({ data }) => data);
      }

      throw error;
    });
};

export default configureAxios;

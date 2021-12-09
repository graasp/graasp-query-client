import { AxiosResponse } from 'axios';
import { isUserAuthenticated } from './utils';
import { FALLBACK_TO_PUBLIC_FOR_STATUS_CODES } from '../config/constants';

// eslint-disable-next-line import/prefer-default-export
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

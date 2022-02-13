import { QueryClientConfig, UUID } from '../types';
import configureAxios, { verifyAuthentication } from './axios';
import { buildDownloadItemRoute } from './routes';

const axios = configureAxios();

/* eslint-disable import/prefer-default-export */
export const downloadItem = async (id: UUID, { API_HOST }: QueryClientConfig) =>
  verifyAuthentication(() =>
    axios({
      url: `${API_HOST}/${buildDownloadItemRoute(id)}`,
      method: 'GET',
      responseType: 'blob',
    }).then(({ data }) => data),
  );

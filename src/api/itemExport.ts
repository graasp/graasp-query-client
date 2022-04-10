import { QueryClientConfig, UUID } from '../types';
import configureAxios, { fallbackToPublic } from './axios';
import { buildExportItemRoute, buildExportPublicItemRoute } from './routes';

const axios = configureAxios();

/* eslint-disable import/prefer-default-export */
export const exportItem = async (
  id: UUID,
  { API_HOST }: QueryClientConfig,
  options?: { public: boolean },
) =>
  fallbackToPublic(
    () =>
      axios({
        url: `${API_HOST}/${buildExportItemRoute(id)}`,
        method: 'GET',
        responseType: 'blob',
      }),
    () =>
      axios({
        url: `${API_HOST}/${buildExportPublicItemRoute(id)}`,
        method: 'GET',
        responseType: 'blob',
      }),
    options,
  );

import { UUID } from '@graasp/sdk';

import { QueryClientConfig } from '../types';
import configureAxios from './axios';
import { buildExportItemRoute } from './routes';

const axios = configureAxios();

/* eslint-disable import/prefer-default-export */
export const exportItem = async (id: UUID, { API_HOST }: QueryClientConfig) =>
  // options?: { public: boolean },
  axios({
    url: `${API_HOST}/${buildExportItemRoute(id)}`,
    method: 'GET',
    responseType: 'blob',
  }).then(({ data }) => data);

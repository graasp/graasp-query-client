import { UUID } from '@graasp/sdk';

import { QueryClientConfig } from '../types';
import configureAxios from './axios';
import { buildExportItemRoute } from './routes';

const axios = configureAxios();

/* eslint-disable import/prefer-default-export */
export const exportItem = async (
  args: { itemId: UUID; type?: string },
  { API_HOST }: QueryClientConfig,
): Promise<Blob> =>
  // options?: { public: boolean },
  axios({
    url: `${API_HOST}/${buildExportItemRoute(args)}`,
    method: 'GET',
    responseType: 'blob',
  }).then(({ data }) => data);

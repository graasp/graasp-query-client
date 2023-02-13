import { UUID } from '@graasp/sdk';

import { QueryClientConfig } from '../types';
import configureAxios, { verifyAuthentication } from './axios';
import { buildItemPublishRoute } from './routes';

const axios = configureAxios();

/* eslint-disable import/prefer-default-export */
export const publishItem = async (
  id: UUID,
  { API_HOST }: QueryClientConfig,
  notification?: boolean,
) =>
  verifyAuthentication(() =>
    axios
      .get(`${API_HOST}/${buildItemPublishRoute(id, notification)}`)
      .then(({ data }) => data),
  );

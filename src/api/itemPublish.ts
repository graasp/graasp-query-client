import { QueryClientConfig, UUID } from '../types';
import configureAxios, { verifyAuthentication } from './axios';
import { buildItemPublishRoute } from './routes';

const axios = configureAxios();

/* eslint-disable import/prefer-default-export */
export const publishItem = async (
  id: UUID,
  notification: boolean,
  { API_HOST }: QueryClientConfig,
) =>
  verifyAuthentication(() =>
    axios
      .get(`${API_HOST}/${buildItemPublishRoute(id, notification)}`)
      .then(({ data }) => data),
  );

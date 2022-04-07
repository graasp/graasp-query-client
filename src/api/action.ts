import { QueryClientConfig, UUID } from '../types';
import configureAxios from './axios';
import { buildGetActions } from './routes';

const axios = configureAxios();

// eslint-disable-next-line import/prefer-default-export
export const getActions = async (
  args: { itemId: UUID; requestedSampleSize: number; view: string },
  { API_HOST }: QueryClientConfig,
) =>
  axios
    .get(`${API_HOST}/${buildGetActions(args.itemId, args)}`)
    .then(({ data }) => data);

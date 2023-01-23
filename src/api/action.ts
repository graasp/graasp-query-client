import { ActionData, UUID } from '@graasp/sdk';

import { QueryClientConfig } from '../types';
import configureAxios from './axios';
import { buildExportActions, buildGetActions } from './routes';

const axios = configureAxios();

export const getActions = async (
  args: { itemId: UUID; requestedSampleSize: number; view: string },
  { API_HOST }: QueryClientConfig,
) =>
  axios
    .get<ActionData>(`${API_HOST}/${buildGetActions(args.itemId, args)}`)
    .then(({ data }) => data);

export const exportActions = async (
  args: { itemId: UUID },
  { API_HOST }: QueryClientConfig,
) => axios.post(`${API_HOST}/${buildExportActions(args.itemId)}`);

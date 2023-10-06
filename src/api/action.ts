import { Action, ActionData, UUID } from '@graasp/sdk';

import { QueryClientConfig } from '../types';
import { AggregateActionsArgs } from '../utils/action';
import configureAxios from './axios';
import {
  buildExportActions,
  buildGetActions,
  buildGetAggregateActions,
  buildPostItemAction,
} from './routes';

const axios = configureAxios();

export const getActions = async (
  args: { itemId: UUID; requestedSampleSize: number; view: string },
  { API_HOST }: QueryClientConfig,
) =>
  axios
    .get<ActionData>(`${API_HOST}/${buildGetActions(args.itemId, args)}`)
    .then(({ data }) => data);

export const getAggregateActions = async (
  args: AggregateActionsArgs,
  { API_HOST }: QueryClientConfig,
) =>
  axios
    .get<{ aggregateResult: number; createdDay: string }[]>(
      `${API_HOST}/${buildGetAggregateActions(args)}`,
    )
    .then(({ data }) => data);

export const exportActions = async (
  args: { itemId: UUID },
  { API_HOST }: QueryClientConfig,
): Promise<void> =>
  axios.post(`${API_HOST}/${buildExportActions(args.itemId)}`);

export const postItemAction = async (
  itemId: UUID,
  payload: { type: string; extra?: { [key: string]: unknown } },
  { API_HOST }: QueryClientConfig,
): Promise<Action> =>
  axios.post(`${API_HOST}/${buildPostItemAction(itemId)}`, payload);

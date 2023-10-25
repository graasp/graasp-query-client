import { Action, ActionData, UUID } from '@graasp/sdk';

import { PartialQueryConfigForApi } from '../types';
import { AggregateActionsArgs } from '../utils/action';
import {
  buildExportActions,
  buildGetActions,
  buildGetAggregateActions,
  buildPostItemAction,
} from './routes';

export const getActions = async (
  args: { itemId: UUID; requestedSampleSize: number; view: string },
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  axios
    .get<ActionData>(`${API_HOST}/${buildGetActions(args.itemId, args)}`)
    .then(({ data }) => data);

export const getAggregateActions = async (
  args: AggregateActionsArgs,
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  axios
    .get<{ aggregateResult: number; createdDay: string }[]>(
      `${API_HOST}/${buildGetAggregateActions(args)}`,
    )
    .then(({ data }) => data);

export const exportActions = async (
  args: { itemId: UUID },
  { API_HOST, axios }: PartialQueryConfigForApi,
): Promise<void> =>
  axios.post(`${API_HOST}/${buildExportActions(args.itemId)}`);

export const postItemAction = async (
  itemId: UUID,
  payload: { type: string; extra?: { [key: string]: unknown } },
  { API_HOST, axios }: PartialQueryConfigForApi,
): Promise<Action> =>
  axios.post(`${API_HOST}/${buildPostItemAction(itemId)}`, payload);

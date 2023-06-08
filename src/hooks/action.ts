import { useQuery } from 'react-query';

import { UUID, convertJs } from '@graasp/sdk';
import { ActionDataRecord } from '@graasp/sdk/frontend';

import * as Api from '../api';
import { buildActionsKey, buildAggregateActionsKey } from '../config/keys';
import { QueryClientConfig } from '../types';

export default (queryConfig: QueryClientConfig) => {
  const { defaultQueryOptions } = queryConfig;

  const useActions = (
    args: {
      itemId: UUID;
      view: string;
      requestedSampleSize: number;
    },
    options?: { enabled?: boolean },
  ) => {
    const enabledValue =
      (options?.enabled ?? true) &&
      Boolean(args.itemId) &&
      Boolean(args.requestedSampleSize);
    return useQuery({
      queryKey: buildActionsKey(args),
      queryFn: () =>
        Api.getActions(args, queryConfig).then(
          (data) => convertJs(data) as ActionDataRecord,
        ),
      ...defaultQueryOptions,
      enabled: enabledValue,
    });
  };

  const useAggregateActions = (
    args: {
      itemId: UUID;
      view: string;
      requestedSampleSize: number;
      type: string;
      countGroupBy: string[];
      aggregateFunction: string;
      aggregateMetric: string;
      aggregateBy: string[];
    },
    options?: { enabled?: boolean },
  ) => {
    const enabledValue =
      (options?.enabled ?? true) &&
      Boolean(args.itemId) &&
      Boolean(args.requestedSampleSize);
    return useQuery({
      queryKey: buildAggregateActionsKey(args),
      queryFn: () =>
        Api.getAggregateActions(args, queryConfig).then((data) =>
          convertJs(data),
        ),
      ...defaultQueryOptions,
      enabled: enabledValue,
    });
  };

  return { useActions, useAggregateActions };
};

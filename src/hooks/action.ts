import { UUID, convertJs } from '@graasp/sdk';
import { ActionDataRecord } from '@graasp/sdk/frontend';

import { useQuery } from 'react-query';

import * as Api from '../api';
import { UndefinedArgument } from '../config/errors';
import { buildActionsKey, buildAggregateActionsKey } from '../config/keys';
import { QueryClientConfig } from '../types';
import { AggregateActionsArgs } from '../utils/action';

export default (queryConfig: QueryClientConfig) => {
  const { defaultQueryOptions } = queryConfig;

  const useActions = (
    args: {
      itemId?: UUID;
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
      queryFn: () => {
        const { itemId } = args;
        if (!itemId) {
          throw new UndefinedArgument();
        }
        return Api.getActions(
          {
            itemId,
            view: args.view,
            requestedSampleSize: args.requestedSampleSize,
          },
          queryConfig,
        ).then((data) => convertJs(data) as ActionDataRecord);
      },
      ...defaultQueryOptions,
      enabled: enabledValue,
    });
  };

  const useAggregateActions = (
    args: Omit<AggregateActionsArgs, 'itemId'> &
      Partial<Pick<AggregateActionsArgs, 'itemId'>>,
    options?: { enabled?: boolean },
  ) => {
    const enabledValue =
      (options?.enabled ?? true) &&
      Boolean(args.itemId) &&
      Boolean(args.requestedSampleSize);
    return useQuery({
      queryKey: buildAggregateActionsKey(args),
      queryFn: () => {
        const { itemId } = args;
        if (!itemId) {
          throw new UndefinedArgument();
        }
        return Api.getAggregateActions(
          args as AggregateActionsArgs,
          queryConfig,
        ).then((data) => convertJs(data));
      },
      ...defaultQueryOptions,
      enabled: enabledValue,
    });
  };

  return { useActions, useAggregateActions };
};

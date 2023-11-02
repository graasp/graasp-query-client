import { UUID, convertJs } from '@graasp/sdk';
import { ActionDataRecord, ImmutableCast } from '@graasp/sdk/frontend';

import { useQuery } from 'react-query';

import * as Api from '../api';
import { UndefinedArgument } from '../config/errors';
import { buildActionsKey, buildAggregateActionsKey } from '../config/keys';
import { QueryClientConfig } from '../types';
import { AggregateActionsArgs, MappedAggregateBy } from '../utils/action';

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
      queryFn: (): Promise<ActionDataRecord> => {
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
        ).then((data) => convertJs(data));
      },
      ...defaultQueryOptions,
      enabled: enabledValue,
    });
  };

  const useAggregateActions = <T extends (keyof MappedAggregateBy)[]>(
    itemId: string | undefined,
    args: Omit<AggregateActionsArgs<T>, 'itemId'>,
    options?: { enabled?: boolean },
  ) => {
    const enabledValue =
      (options?.enabled ?? true) &&
      Boolean(itemId) &&
      Boolean(args.requestedSampleSize);
    return useQuery({
      queryKey: buildAggregateActionsKey(itemId, args),
      queryFn: (): Promise<
        ImmutableCast<
          ({ aggregateResult: number } & {
            // this adds a key for each element in the aggregation array and sets it to the relevant type
            [Key in T[number]]: MappedAggregateBy[Key];
          })[]
        >
      > => {
        if (!itemId) {
          throw new UndefinedArgument();
        }
        return Api.getAggregateActions({ itemId, ...args }, queryConfig).then(
          (data) => convertJs(data),
        );
      },
      ...defaultQueryOptions,
      enabled: enabledValue,
    });
  };

  return { useActions, useAggregateActions };
};

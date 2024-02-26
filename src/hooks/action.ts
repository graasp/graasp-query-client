import { UUID } from '@graasp/sdk';

import { useQuery } from 'react-query';

import * as Api from '../api/action.js';
import { UndefinedArgument } from '../config/errors.js';
import { buildActionsKey, buildAggregateActionsKey } from '../config/keys.js';
import { QueryClientConfig } from '../types.js';
import { AggregateActionsArgs, MappedAggregateBy } from '../utils/action.js';

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
        );
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
      queryFn: () => {
        if (!itemId) {
          throw new UndefinedArgument();
        }
        return Api.getAggregateActions<T>({ itemId, ...args }, queryConfig);
      },
      ...defaultQueryOptions,
      enabled: enabledValue,
    });
  };

  return { useActions, useAggregateActions };
};

import { useQuery } from 'react-query';

import { UUID, convertJs } from '@graasp/sdk';
import { ActionDataRecord } from '@graasp/sdk/frontend';

import * as Api from '../api';
import { UndefinedArgument } from '../config/errors';
import { buildActionsKey } from '../config/keys';
import { QueryClientConfig } from '../types';

export default (queryConfig: QueryClientConfig) => {
  const { defaultQueryOptions } = queryConfig;

  return {
    useActions: (
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
    },
  };
};

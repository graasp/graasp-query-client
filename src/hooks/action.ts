import { Map } from 'immutable';
import { useQuery } from 'react-query';
import * as Api from '../api';
import { buildActionsKey } from '../config/keys';
import { QueryClientConfig, UUID } from '../types';

export default (queryConfig: QueryClientConfig) => {
  const { defaultQueryOptions } = queryConfig;

  return {
    useActions: (
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
          Api.getActions(args, queryConfig).then((data) => Map(data)),
        ...defaultQueryOptions,
        enabled: enabledValue,
      });
    },
  };
};

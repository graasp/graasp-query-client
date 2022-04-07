import { Map } from 'immutable';
import { useQuery } from 'react-query';
import * as Api from '../api';
import { buildActionsKey } from '../config/keys';
import { QueryClientConfig, UUID } from '../types';

export default (queryConfig: QueryClientConfig) => {
  const { retry, cacheTime, staleTime } = queryConfig;
  const defaultOptions = {
    retry,
    cacheTime,
    staleTime,
  };

  return {
    useActions: (
      args: {
        itemId: UUID;
        view: string;
        requestedSampleSize: number;
      },
      options: { enabled?: boolean },
    ) => {
      const enabledValue = Boolean(options?.enabled) ?? false;
      return useQuery({
        queryKey: buildActionsKey(args),
        queryFn: () =>
          Api.getActions(args, queryConfig).then((data) => Map(data)),
        ...defaultOptions,
        enabled: enabledValue,
      });
    },
  };
};

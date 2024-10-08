import { useQuery } from '@tanstack/react-query';

import { memberKeys } from '../../keys.js';
import { QueryClientConfig } from '../../types.js';
import { getPasswordStatus } from './api.js';

export default (queryConfig: QueryClientConfig) => {
  const { defaultQueryOptions } = queryConfig;

  return {
    usePasswordStatus: () =>
      useQuery({
        queryKey: memberKeys.current().passwordStatus,
        queryFn: () => getPasswordStatus(queryConfig),
        ...defaultQueryOptions,
      }),
  };
};

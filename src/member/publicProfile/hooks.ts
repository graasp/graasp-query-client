import { UUID } from '@graasp/sdk';

import { useQuery } from '@tanstack/react-query';

import { UndefinedArgument } from '../../config/errors.js';
import { memberKeys } from '../../keys.js';
import { QueryClientConfig } from '../../types.js';
import * as Api from './api.js';

export default (queryConfig: QueryClientConfig) => {
  const { defaultQueryOptions } = queryConfig;

  return {
    useOwnProfile: () =>
      useQuery({
        queryKey: memberKeys.current().profile,
        queryFn: () => Api.getOwnProfile(queryConfig),
        ...defaultQueryOptions,
      }),

    usePublicProfile: (memberId?: UUID) =>
      useQuery({
        queryKey: memberKeys.single(memberId).profile,
        queryFn: () => {
          if (!memberId) {
            throw new UndefinedArgument();
          }
          return Api.getPublicProfile(memberId, queryConfig);
        },
        enabled: Boolean(memberId),
        ...defaultQueryOptions,
      }),
  };
};

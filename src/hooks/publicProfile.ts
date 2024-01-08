import { UUID } from '@graasp/sdk';

import { useQuery } from 'react-query';

import * as Api from '../api';
import { UndefinedArgument } from '../config/errors';
import { OWN_PUBLIC_PROFILE_KEY, buildPublicProfileKey } from '../config/keys';
import { QueryClientConfig } from '../types';

export default (queryConfig: QueryClientConfig) => {
  const { defaultQueryOptions } = queryConfig;

  return {
    useOwnProfile: () =>
      useQuery({
        queryKey: OWN_PUBLIC_PROFILE_KEY,
        queryFn: () => Api.getOwnProfile(queryConfig),
        ...defaultQueryOptions,
      }),

    usePublicProfile: (memberId: UUID) =>
      useQuery({
        queryKey: buildPublicProfileKey(memberId),
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
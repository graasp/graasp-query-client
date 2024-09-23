import { UUID } from '@graasp/sdk';

import { useQuery } from '@tanstack/react-query';

import { UndefinedArgument } from '../../config/errors.js';
import { QueryClientConfig } from '../../types.js';
import { getMembershipRequests, getOwnMembershipRequest } from './api.js';
import { membershipRequestsKeys } from './keys.js';

export default (queryConfig: QueryClientConfig) => {
  const { defaultQueryOptions } = queryConfig;

  return {
    useOwnMembershipRequest: (itemId: UUID) =>
      useQuery({
        queryKey: membershipRequestsKeys.own(itemId),
        queryFn: () => getOwnMembershipRequest({ id: itemId }, queryConfig),
        ...defaultQueryOptions,
      }),

    useMembershipRequests: (id?: UUID, options: { enabled?: boolean } = {}) =>
      useQuery({
        queryKey: membershipRequestsKeys.single(id),
        queryFn: () => {
          if (!id) {
            throw new UndefinedArgument();
          }
          return getMembershipRequests({ id }, queryConfig);
        },
        enabled: (options.enabled ?? true) && Boolean(id),
        ...defaultQueryOptions,
      }),
  };
};

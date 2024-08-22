import { UUID } from '@graasp/sdk';

import { useQuery } from '@tanstack/react-query';

import * as Api from '../api/invitation.js';
import { UndefinedArgument } from '../config/errors.js';
import { buildInvitationKey, itemKeys } from '../keys.js';
import { getInvitationRoutine } from '../routines/invitation.js';
import { QueryClientConfig } from '../types.js';

export default (queryConfig: QueryClientConfig) => {
  const { defaultQueryOptions } = queryConfig;

  const useInvitation = (id?: UUID) =>
    useQuery({
      queryKey: buildInvitationKey(id),
      queryFn: () => {
        if (!id) {
          throw new UndefinedArgument();
        }
        return Api.getInvitation(queryConfig, id);
      },
      meta: {
        routine: getInvitationRoutine,
      },
      ...defaultQueryOptions,
      enabled: Boolean(id),
    });

  const useItemInvitations = (
    itemId?: UUID,
    options: { enabled?: boolean } = {},
  ) =>
    useQuery({
      queryKey: itemKeys.single(itemId).invitation,
      queryFn: () => {
        if (!itemId) {
          throw new UndefinedArgument();
        }

        return Api.getInvitationsForItem(itemId, queryConfig);
      },
      enabled: Boolean(itemId) && (options?.enabled ?? true),
      ...defaultQueryOptions,
    });

  return { useInvitation, useItemInvitations };
};

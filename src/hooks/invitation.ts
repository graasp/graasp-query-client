import { UUID } from '@graasp/sdk';

import { useQuery } from '@tanstack/react-query';

import * as Api from '../api/invitation.js';
import { UndefinedArgument } from '../config/errors.js';
import { buildInvitationKey, itemKeys } from '../config/keys.js';
import { getInvitationRoutine } from '../routines/invitation.js';
import { QueryClientConfig } from '../types.js';

export default (queryConfig: QueryClientConfig) => {
  const { notifier, defaultQueryOptions } = queryConfig;

  const useInvitation = (id?: UUID) =>
    useQuery({
      queryKey: buildInvitationKey(id),
      queryFn: () => {
        if (!id) {
          throw new UndefinedArgument();
        }
        return Api.getInvitation(queryConfig, id);
      },
      ...defaultQueryOptions,
      enabled: Boolean(id),
      onError: (error) => {
        notifier?.({ type: getInvitationRoutine.FAILURE, payload: { error } });
      },
    });

  const useItemInvitations = (itemId?: UUID) =>
    useQuery({
      queryKey: itemKeys.single(itemId).invitation,
      queryFn: () => {
        if (!itemId) {
          throw new UndefinedArgument();
        }

        return Api.getInvitationsForItem(itemId, queryConfig);
      },
      enabled: Boolean(itemId),
      ...defaultQueryOptions,
    });

  return { useInvitation, useItemInvitations };
};

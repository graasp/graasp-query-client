import { Invitation, UUID } from '@graasp/sdk';

import { useQuery } from 'react-query';

import * as Api from '../api';
import { UndefinedArgument } from '../config/errors';
import { buildInvitationKey, buildItemInvitationsKey } from '../config/keys';
import { getInvitationRoutine } from '../routines';
import { QueryClientConfig } from '../types';

export default (queryConfig: QueryClientConfig) => {
  const { notifier, defaultQueryOptions } = queryConfig;

  const useInvitation = (id?: UUID) =>
    useQuery({
      queryKey: buildInvitationKey(id),
      queryFn: (): Promise<Invitation> => {
        if (!id) {
          throw new UndefinedArgument();
        }
        return Api.getInvitation(queryConfig, id).then((data) => data);
      },
      ...defaultQueryOptions,
      enabled: Boolean(id),
      onError: (error) => {
        notifier?.({ type: getInvitationRoutine.FAILURE, payload: { error } });
      },
    });

  const useItemInvitations = (id?: UUID) =>
    useQuery({
      queryKey: buildItemInvitationsKey(id),
      queryFn: (): Promise<Invitation[]> => {
        if (!id) {
          throw new UndefinedArgument();
        }

        return Api.getInvitationsForItem(id, queryConfig).then((data) => data);
      },
      enabled: Boolean(id),
      ...defaultQueryOptions,
    });

  return { useInvitation, useItemInvitations };
};

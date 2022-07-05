import { useQuery } from 'react-query';
import { Map, List } from 'immutable';
import { QueryClientConfig, UndefinedArgument, UUID } from '../types';
import * as Api from '../api';
import { buildInvitationKey, buildItemInvitationsKey } from '../config/keys';
import { getInvitationRoutine } from '../routines';

export default (queryConfig: QueryClientConfig) => {
  const { notifier, defaultQueryOptions } = queryConfig;

  const useInvitation = (id: UUID) =>
    useQuery({
      queryKey: buildInvitationKey(id),
      queryFn: () =>
        Api.getInvitation(queryConfig, id).then((data) => Map(data)),
      ...defaultQueryOptions,
      enabled: Boolean(id),
      onError: (error) => {
        notifier?.({ type: getInvitationRoutine.FAILURE, payload: { error } });
      },
    });

  const useItemInvitations = (id?: UUID) =>
    useQuery({
      queryKey: buildItemInvitationsKey(id),
      queryFn: () => {
        if (!id) {
          throw new UndefinedArgument();
        }

        return Api.getInvitationsForItem(id, queryConfig).then((data) =>
          List(data),
        );
      },
      enabled: Boolean(id),
      ...defaultQueryOptions,
    });

  return { useInvitation, useItemInvitations };
};

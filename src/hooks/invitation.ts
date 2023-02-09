import { useQuery } from 'react-query';

import { convertJs } from '@graasp/sdk';
import { List } from 'immutable';

import * as Api from '../api';
import { UndefinedArgument } from '../config/errors';
import { buildInvitationKey, buildItemInvitationsKey } from '../config/keys';
import { getInvitationRoutine } from '../routines';
import { InvitationRecord, QueryClientConfig, UUID } from '../types';

export default (queryConfig: QueryClientConfig) => {
  const { notifier, defaultQueryOptions } = queryConfig;

  const useInvitation = (id: UUID) =>
    useQuery({
      queryKey: buildInvitationKey(id),
      queryFn: () =>
        Api.getInvitation(queryConfig, id).then((data) => convertJs(data) as InvitationRecord),
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
          convertJs(data) as List<InvitationRecord>,
        );
      },
      enabled: Boolean(id),
      ...defaultQueryOptions,
    });

  return { useInvitation, useItemInvitations };
};

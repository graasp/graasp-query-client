import { useMutation, useQueryClient } from 'react-query';

import { UUID } from '@graasp/sdk';
import { MemberRecord } from '@graasp/sdk/frontend';

import * as Api from '../api';
import {
  CURRENT_MEMBER_KEY,
  buildItemPublishedInformationKey,
  buildPublishedItemsForMemberKey,
  buildPublishedItemsKey,
} from '../config/keys';
import { publishItemRoutine, unpublishItemRoutine } from '../routines';
import { QueryClientConfig } from '../types';

export default (queryConfig: QueryClientConfig) => {
  const { notifier } = queryConfig;

  /**
   * @param notification {boolean} send out email notification
   */
  const usePublishItem = () => {
    const queryClient = useQueryClient();
    return useMutation(
      ({ id, notification }: { id: UUID; notification: boolean }) =>
        Api.publishItem(id, queryConfig, notification),
      {
        onSuccess: () => {
          notifier?.({ type: publishItemRoutine.SUCCESS });
        },
        onError: (error: Error) => {
          notifier?.({ type: publishItemRoutine.FAILURE, payload: { error } });
        },
        onSettled: (_data, _error, { id }) => {
          queryClient.invalidateQueries(buildItemPublishedInformationKey(id));
          const currentMemberId =
            queryClient.getQueryData<MemberRecord>(CURRENT_MEMBER_KEY)?.id;
          if (currentMemberId) {
            queryClient.invalidateQueries(
              buildPublishedItemsForMemberKey(currentMemberId),
            );
          }
          queryClient.invalidateQueries(buildPublishedItemsKey());
        },
      },
    );
  };

  const useUnpublishItem = () => {
    const queryClient = useQueryClient();
    return useMutation(
      ({ id }: { id: UUID }) => Api.unpublishItem(id, queryConfig),
      {
        onSuccess: () => {
          notifier?.({ type: unpublishItemRoutine.SUCCESS });
        },
        onError: (error: Error) => {
          notifier?.({
            type: unpublishItemRoutine.FAILURE,
            payload: { error },
          });
        },
        onSettled: (_data, _error, { id }) => {
          queryClient.invalidateQueries(buildItemPublishedInformationKey(id));
          const currentMemberId =
            queryClient.getQueryData<MemberRecord>(CURRENT_MEMBER_KEY)?.id;
          if (currentMemberId) {
            queryClient.invalidateQueries(
              buildPublishedItemsForMemberKey(currentMemberId),
            );
          }
          queryClient.invalidateQueries(buildPublishedItemsKey());
        },
      },
    );
  };

  return {
    usePublishItem,
    useUnpublishItem,
  };
};

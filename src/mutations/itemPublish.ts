import { CompleteMember, UUID } from '@graasp/sdk';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import * as Api from '../api/itemPublish.js';
import { itemKeys, memberKeys } from '../config/keys.js';
import {
  publishItemRoutine,
  unpublishItemRoutine,
} from '../routines/itemPublish.js';
import { QueryClientConfig } from '../types.js';

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
          queryClient.invalidateQueries(
            itemKeys.single(id).publishedInformation,
          );
          const currentMemberId = queryClient.getQueryData<CompleteMember>(
            memberKeys.current().content,
          )?.id;
          if (currentMemberId) {
            queryClient.invalidateQueries(
              itemKeys.published().byMember(currentMemberId),
            );
          }
          queryClient.invalidateQueries(itemKeys.published().all);
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
          queryClient.invalidateQueries(
            itemKeys.single(id).publishedInformation,
          );
          const currentMemberId = queryClient.getQueryData<CompleteMember>(
            memberKeys.current().content,
          )?.id;
          if (currentMemberId) {
            queryClient.invalidateQueries(
              itemKeys.published().byMember(currentMemberId),
            );
          }
          queryClient.invalidateQueries(itemKeys.published().all);
        },
      },
    );
  };

  return {
    usePublishItem,
    useUnpublishItem,
  };
};

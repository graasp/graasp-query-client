import { QueryClient, useMutation } from 'react-query';

import { UUID } from '@graasp/sdk';
import { MemberRecord } from '@graasp/sdk/frontend';

import * as Api from '../api';
import {
  CURRENT_MEMBER_KEY,
  MUTATION_KEYS,
  buildItemPublishedInformationKey,
  buildPublishedItemsForMemberKey,
  buildPublishedItemsKey,
} from '../config/keys';
import { publishItemRoutine, unpublishItemRoutine } from '../routines';
import { QueryClientConfig } from '../types';

export default (queryClient: QueryClient, queryConfig: QueryClientConfig) => {
  const { notifier } = queryConfig;

  /**
   * @param notification {boolean} send out email notification
   */
  queryClient.setMutationDefaults(MUTATION_KEYS.PUBLISH_ITEM, {
    mutationFn: ({ id, notification }) =>
      Api.publishItem(id, queryConfig, notification),
    onSuccess: () => {
      notifier?.({ type: publishItemRoutine.SUCCESS });
    },
    onError: (error) => {
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
  });
  const usePublishItem = () =>
    useMutation<void, unknown, { id: UUID; notification: boolean }>(
      MUTATION_KEYS.PUBLISH_ITEM,
    );

  queryClient.setMutationDefaults(MUTATION_KEYS.UNPUBLISH_ITEM, {
    mutationFn: ({ id }) => Api.unpublishItem(id, queryConfig),
    onSuccess: () => {
      notifier?.({ type: unpublishItemRoutine.SUCCESS });
    },
    onError: (error) => {
      notifier?.({ type: unpublishItemRoutine.FAILURE, payload: { error } });
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
  });
  const useUnpublishItem = () =>
    useMutation<void, unknown, { id: UUID }>(MUTATION_KEYS.UNPUBLISH_ITEM);

  return {
    usePublishItem,
    useUnpublishItem,
  };
};

import { QueryClient, useMutation } from 'react-query';

import { UUID } from '@graasp/sdk';

import * as Api from '../api';
import { MUTATION_KEYS, itemTagsKeys } from '../config/keys';
import { publishItemRoutine } from '../routines';
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
      queryClient.invalidateQueries(itemTagsKeys.singleId(id));
    },
  });
  const usePublishItem = () =>
    useMutation<void, unknown, { id: UUID; notification: string }>(
      MUTATION_KEYS.PUBLISH_ITEM,
    );

  return {
    usePublishItem,
  };
};

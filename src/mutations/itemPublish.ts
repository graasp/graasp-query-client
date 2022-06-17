import { QueryClient } from 'react-query';
import * as Api from '../api';
import { MUTATION_KEYS, buildItemTagsKey } from '../config/keys';
import { publishItemRoutine } from '../routines';
import { QueryClientConfig } from '../types';

export default (queryClient: QueryClient, queryConfig: QueryClientConfig) => {
  const { notifier } = queryConfig;

  /**
   * @param notification {boolean} send out email notification
   */
  queryClient.setMutationDefaults(MUTATION_KEYS.PUBLISH_ITEM, {
    mutationFn: ({ id, notification }) => Api.publishItem(id, notification, queryConfig ),
    onSuccess: () => {
      notifier?.({ type: publishItemRoutine.SUCCESS });
    },
    onError: (error) => {
      notifier?.({ type: publishItemRoutine.FAILURE, payload: { error } });
    },
    onSettled: (_data, _error, { id }) => {
      queryClient.invalidateQueries(buildItemTagsKey(id));
    },
  });
};

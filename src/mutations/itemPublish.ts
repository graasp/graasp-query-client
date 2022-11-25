import { QueryClient } from '@tanstack/react-query';

import * as Api from '../api';
import { MUTATION_KEYS, buildItemTagsKey } from '../config/keys';
import { publishItemRoutine } from '../routines';
import { QueryClientConfig } from '../types';
import { convertFalseToUndefined } from '../utils/util';

export default (queryClient: QueryClient, queryConfig: QueryClientConfig) => {
  const { notifier } = queryConfig;

  /**
   * @param notification {boolean} send out email notification
   */
  queryClient.setMutationDefaults(MUTATION_KEYS.PUBLISH_ITEM, {
    mutationFn: ({ id, notification }) =>
      Api.publishItem(id, queryConfig, convertFalseToUndefined(notification)),
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

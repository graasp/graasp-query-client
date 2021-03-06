import { SUCCESS_MESSAGES } from '@graasp/translations';
import { QueryClient } from 'react-query';
import { buildItemFlagsKey, MUTATION_KEYS } from '../config/keys';
import { postItemFlagRoutine } from '../routines';
import * as Api from '../api';
import { QueryClientConfig } from '../types';

export default (queryClient: QueryClient, queryConfig: QueryClientConfig) => {
  const { notifier } = queryConfig;

  queryClient.setMutationDefaults(MUTATION_KEYS.POST_ITEM_FLAG, {
    mutationFn: (payload) => Api.postItemFlag(payload, queryConfig),
    onSuccess: () => {
      notifier?.({
        type: postItemFlagRoutine.SUCCESS,
        payload: { message: SUCCESS_MESSAGES.POST_ITEM_FLAG },
      });
    },
    onError: (error) => {
      notifier?.({ type: postItemFlagRoutine.FAILURE, payload: { error } });
    },
    onSettled: (_data, _error, { itemId }) => {
      queryClient.invalidateQueries(buildItemFlagsKey(itemId));
    },
  });
};

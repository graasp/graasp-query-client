import { QueryClient, useMutation } from 'react-query';

import { UUID } from '@graasp/sdk';
import { SUCCESS_MESSAGES } from '@graasp/translations';

import * as Api from '../api';
import { MUTATION_KEYS, buildItemFlagsKey } from '../config/keys';
import { postItemFlagRoutine } from '../routines';
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
  const usePostItemFlag = () =>
    useMutation<void, unknown, { flagId: UUID; itemId: UUID }>(
      MUTATION_KEYS.POST_ITEM_FLAG,
    );

  return {
    usePostItemFlag,
  };
};

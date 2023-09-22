import { SUCCESS_MESSAGES } from '@graasp/translations';

import { useMutation, useQueryClient } from 'react-query';

import * as Api from '../api';
import { createItemRoutine } from '../routines';
import type { QueryClientConfig } from '../types';

export default (queryConfig: QueryClientConfig) => {
  const { notifier } = queryConfig;

  const usePostBug = () => {
    const queryClient = useQueryClient();
    return useMutation(
      async (bug: Api.PostBugPayloadType) => Api.postBug(bug, queryConfig),
      {
        onSuccess: () => {
          notifier?.({
            type: createItemRoutine.SUCCESS,
            payload: { message: SUCCESS_MESSAGES.CREATE_ITEM },
          });
        },
        onError: (error: Error) => {
          notifier?.({ type: createItemRoutine.FAILURE, payload: { error } });
        },
      },
    );
  };
  return { usePostBug };
};

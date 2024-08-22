import { UUID } from '@graasp/sdk';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import * as Api from '../api/itemValidation.js';
import { itemKeys } from '../keys.js';
import { postItemValidationRoutine } from '../routines/itemValidation.js';
import { QueryClientConfig } from '../types.js';

export default (queryConfig: QueryClientConfig) => {
  const { notifier } = queryConfig;

  const usePostItemValidation = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (payload: { itemId: UUID }) =>
        Api.postItemValidation(payload, queryConfig),
      onSuccess: () => {
        notifier?.({
          type: postItemValidationRoutine.SUCCESS,
        });
      },
      onError: (error: Error) => {
        notifier?.({
          type: postItemValidationRoutine.FAILURE,
          payload: { error },
        });
      },
      onSettled: (_data, _error, { itemId }) => {
        queryClient.invalidateQueries({
          queryKey: itemKeys.single(itemId).validation,
        });
      },
    });
  };

  return {
    usePostItemValidation,
  };
};

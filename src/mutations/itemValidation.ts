import { UUID } from '@graasp/sdk';

import { useMutation, useQueryClient } from 'react-query';

import * as Api from '../api';
import { buildLastItemValidationGroupKey } from '../config/keys';
import { postItemValidationRoutine } from '../routines';
import { QueryClientConfig } from '../types';

export default (queryConfig: QueryClientConfig) => {
  const { notifier } = queryConfig;

  const usePostItemValidation = () => {
    const queryClient = useQueryClient();
    return useMutation(
      (payload: { itemId: UUID }) =>
        Api.postItemValidation(payload, queryConfig),
      {
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
          queryClient.invalidateQueries(
            buildLastItemValidationGroupKey(itemId),
          );
        },
      },
    );
  };

  return {
    usePostItemValidation,
  };
};

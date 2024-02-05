import { FlagType, UUID } from '@graasp/sdk';
import { SUCCESS_MESSAGES } from '@graasp/translations';

import { useMutation, useQueryClient } from 'react-query';

import * as Api from '../api';
import { itemKeys } from '../config/keys';
import { postItemFlagRoutine } from '../routines';
import { QueryClientConfig } from '../types';

export default (queryConfig: QueryClientConfig) => {
  const { notifier } = queryConfig;

  const usePostItemFlag = () => {
    const queryClient = useQueryClient();
    return useMutation(
      (payload: { type: FlagType; itemId: UUID }) =>
        Api.postItemFlag(payload, queryConfig),
      {
        onSuccess: () => {
          notifier?.({
            type: postItemFlagRoutine.SUCCESS,
            payload: { message: SUCCESS_MESSAGES.POST_ITEM_FLAG },
          });
        },
        onError: (error: Error) => {
          console.error(error);
          notifier?.({ type: postItemFlagRoutine.FAILURE, payload: { error } });
        },
        onSettled: (_data, _error, { itemId }) => {
          queryClient.invalidateQueries(itemKeys.single(itemId).flags);
        },
      },
    );
  };

  return {
    usePostItemFlag,
  };
};

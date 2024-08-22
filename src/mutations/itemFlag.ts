import { FlagType, UUID } from '@graasp/sdk';
import { SUCCESS_MESSAGES } from '@graasp/translations';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import * as Api from '../api/itemFlag.js';
import { itemKeys } from '../keys.js';
import { postItemFlagRoutine } from '../routines/itemFlag.js';
import { QueryClientConfig } from '../types.js';

export default (queryConfig: QueryClientConfig) => {
  const { notifier } = queryConfig;

  const usePostItemFlag = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (payload: { type: FlagType; itemId: UUID }) =>
        Api.postItemFlag(payload, queryConfig),
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
        queryClient.invalidateQueries({
          queryKey: itemKeys.single(itemId).flags,
        });
      },
    });
  };

  return {
    usePostItemFlag,
  };
};

import { DiscriminatedItem } from '@graasp/sdk';
import { SUCCESS_MESSAGES } from '@graasp/translations';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import * as Api from '../api/etherpad.js';
import { createEtherpadRoutine } from '../item/routines.js';
import { getKeyForParentId } from '../keys.js';
import { QueryClientConfig } from '../types.js';

export default (queryConfig: QueryClientConfig) => {
  const { notifier } = queryConfig;

  const usePostEtherpad = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async (
        params: Pick<DiscriminatedItem, 'name'> & {
          parentId?: string;
        },
      ) => Api.postEtherpad(params, queryConfig),
      // we cannot optimistically add an item because we need its id
      onSuccess: () => {
        notifier?.({
          type: createEtherpadRoutine.SUCCESS,
          payload: { message: SUCCESS_MESSAGES.CREATE_ITEM },
        });
      },
      onError: (error: Error) => {
        notifier?.({
          type: createEtherpadRoutine.FAILURE,
          payload: { error },
        });
      },
      onSettled: (_data, _error, { parentId }) => {
        const key = getKeyForParentId(parentId);
        queryClient.invalidateQueries({ queryKey: key });
      },
    });
  };
  return {
    usePostEtherpad,
  };
};

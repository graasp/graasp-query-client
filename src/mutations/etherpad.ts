import { DiscriminatedItem } from '@graasp/sdk';
import { SUCCESS_MESSAGES } from '@graasp/translations';

import { useMutation, useQueryClient } from 'react-query';

import * as Api from '../api/etherpad.js';
import { getKeyForParentId } from '../config/keys.js';
import { createEtherpadRoutine } from '../routines/item.js';
import { QueryClientConfig } from '../types.js';

export default (queryConfig: QueryClientConfig) => {
  const { notifier } = queryConfig;

  const usePostEtherpad = () => {
    const queryClient = useQueryClient();
    return useMutation(
      async (
        params: Pick<DiscriminatedItem, 'name'> & {
          parentId?: string;
        },
      ) => Api.postEtherpad(params, queryConfig),
      // we cannot optimistically add an item because we need its id
      {
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
          queryClient.invalidateQueries(key);
        },
      },
    );
  };
  return {
    usePostEtherpad,
  };
};

import { UUID } from '@graasp/sdk';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { itemKeys } from '../../keys.js';
import { QueryClientConfig } from '../../types.js';
import { reorderItemRoutine } from '../routines.js';
import { reorderItem } from './api.js';

export const useReorderItem = (queryConfig: QueryClientConfig) => () => {
  const { notifier } = queryConfig;
  const queryClient = useQueryClient();
  return useMutation(
    (args: { id: UUID; parentItemId: UUID; previousItemId?: UUID }) =>
      reorderItem(args, queryConfig),
    {
      onSuccess: (_data, args) => {
        queryClient.invalidateQueries(
          itemKeys.single(args.parentItemId).allChildren,
        );
        notifier?.({ type: reorderItemRoutine.SUCCESS });
      },
      onError: (error: Error) => {
        notifier?.({ type: reorderItemRoutine.FAILURE, payload: { error } });

        // does not settled since endpoint is async
      },
    },
  );
};

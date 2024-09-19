import { UUID } from '@graasp/sdk';
import { SUCCESS_MESSAGES } from '@graasp/translations';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { itemKeys } from '../../keys.js';
import { QueryClientConfig } from '../../types.js';
import { enroll } from './api.js';
import { enrollRoutine } from './routines.js';

export const useEnroll = (queryConfig: QueryClientConfig) => {
  const { notifier } = queryConfig;

  const queryClient = useQueryClient();
  return useMutation(
    (payload: { itemId: UUID }) => enroll(payload, queryConfig),
    {
      onSuccess: () => {
        notifier?.({
          type: enrollRoutine.SUCCESS,
          payload: { message: SUCCESS_MESSAGES.REQUEST_MEMBERSHIP },
        });
      },
      onError: (error: Error, _args, _context) => {
        notifier?.({
          type: enrollRoutine.FAILURE,
          payload: { error },
        });
      },
      onSettled: (_data, _error, { itemId }) => {
        // on success, enroll should have given membership to the user
        queryClient.invalidateQueries(itemKeys.single(itemId).memberships);
      },
    },
  );
};

import { UUID } from '@graasp/sdk';

import { useMutation } from 'react-query';

import { exportActions, postItemAction } from '../api';
import { exportActionsRoutine, postActionRoutine } from '../routines';
import { QueryClientConfig } from '../types';

export default (queryConfig: QueryClientConfig) => {
  const usePostItemAction = () =>
    useMutation(
      (args: {
        itemId: UUID;
        payload: { type: string; extra?: { [key: string]: unknown } };
      }) => postItemAction(args.itemId, args.payload, queryConfig),
      {
        onSuccess: () => {
          queryConfig.notifier?.({
            type: postActionRoutine.SUCCESS,
          });
        },
        onError: (error: Error) => {
          queryConfig.notifier?.({
            type: postActionRoutine.FAILURE,
            payload: { error },
          });
        },
      },
    );

  const useExportActions = () =>
    useMutation((itemId: UUID) => exportActions({ itemId }, queryConfig), {
      onSuccess: () => {
        queryConfig.notifier?.({
          type: exportActionsRoutine.SUCCESS,
        });
      },
      onError: (error: Error) => {
        queryConfig.notifier?.({
          type: exportActionsRoutine.FAILURE,
          payload: { error },
        });
      },
    });

  return {
    usePostItemAction,
    useExportActions,
  };
};

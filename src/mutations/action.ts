import { ExportActionsFormatting, UUID } from '@graasp/sdk';

import { useMutation } from '@tanstack/react-query';

import { exportActions, postItemAction } from '../api/action.js';
import { exportActionsRoutine, postActionRoutine } from '../routines/action.js';
import { QueryClientConfig } from '../types.js';

export default (queryConfig: QueryClientConfig) => {
  const usePostItemAction = () =>
    useMutation({
      mutationFn: (args: {
        itemId: UUID;
        payload: { type: string; extra?: { [key: string]: unknown } };
      }) => postItemAction(args.itemId, args.payload, queryConfig),
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
    });

  const useExportActions = () =>
    useMutation({
      mutationFn: (payload: {
        itemId: UUID;
        format: ExportActionsFormatting;
      }) => exportActions(payload, queryConfig),
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

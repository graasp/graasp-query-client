import { UUID } from '@graasp/sdk';

import { useMutation } from 'react-query';

import { exportActions, postAction } from '../api';
import { exportActionsRoutine } from '../routines';
import { QueryClientConfig } from '../types';

export default (queryConfig: QueryClientConfig) => {
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
  const usePostAction = () =>
    useMutation(
      (payload: { type: string; itemId: UUID }) =>
        postAction(payload, queryConfig),
      {
        onSuccess: () => {
          console.log('success action mutation');
        },
        onError: (error: Error) => {
          console.log(error, 'error post action mutation');
        },
      },
    );

  return {
    useExportActions,
    usePostAction,
  };
};

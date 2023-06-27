import { useMutation } from 'react-query';

import { UUID } from '@graasp/sdk';

import { exportActions } from '../api';
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

  return {
    useExportActions,
  };
};

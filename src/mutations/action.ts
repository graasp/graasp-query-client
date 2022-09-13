import { QueryClient } from 'react-query';

import { exportActions } from '../api';
import { MUTATION_KEYS } from '../config/keys';
import { exportActionsRoutine } from '../routines';
import { QueryClientConfig } from '../types';

const { EXPORT_ACTIONS } = MUTATION_KEYS;

export default (queryClient: QueryClient, queryConfig: QueryClientConfig) => {
  queryClient.setMutationDefaults(EXPORT_ACTIONS, {
    mutationFn: (itemId) => exportActions({ itemId }, queryConfig),
    onSuccess: () => {
      queryConfig.notifier?.({
        type: exportActionsRoutine.SUCCESS,
      });
    },
    onError: (error) => {
      queryConfig.notifier?.({
        type: exportActionsRoutine.FAILURE,
        payload: { error },
      });
    },
  });
};

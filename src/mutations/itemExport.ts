import { QueryClient } from 'react-query';
import * as Api from '../api';
import { MUTATION_KEYS } from '../config/keys';
import { exportItemRoutine } from '../routines';
import { QueryClientConfig } from '../types';

export default (queryClient: QueryClient, queryConfig: QueryClientConfig) => {
  const { notifier } = queryConfig;

  /**
   * @param options.public {boolean} force fallback to public endpoint
   */
  queryClient.setMutationDefaults(MUTATION_KEYS.EXPORT_ZIP, {
    mutationFn: ({ id, options }) => Api.exportItem(id, queryConfig, options),
    onSuccess: () => {
      notifier?.({ type: exportItemRoutine.SUCCESS });
    },
    onError: (error) => {
      notifier?.({ type: exportItemRoutine.FAILURE, payload: { error } });
    },
  });
};

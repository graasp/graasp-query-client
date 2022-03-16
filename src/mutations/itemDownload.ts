import { QueryClient } from 'react-query';
import * as Api from '../api';
import { MUTATION_KEYS } from '../config/keys';
import { downloadItemRoutine } from '../routines';
import { QueryClientConfig } from '../types';

export default (queryClient: QueryClient, queryConfig: QueryClientConfig) => {
  const { notifier } = queryConfig;

  queryClient.setMutationDefaults(MUTATION_KEYS.EXPORT_ZIP, {
    mutationFn: (id) => Api.downloadItem(id, queryConfig).then((data) => data),
    onSuccess: () => {
      notifier?.({ type: downloadItemRoutine.SUCCESS });
    },
    onError: (error) => {
      notifier?.({ type: downloadItemRoutine.FAILURE, payload: { error } });
    },
  });
};

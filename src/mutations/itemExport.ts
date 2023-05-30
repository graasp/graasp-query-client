import { QueryClient, useMutation } from 'react-query';

import { UUID } from '@graasp/sdk';

import * as Api from '../api';
import { MUTATION_KEYS } from '../config/keys';
import { exportItemRoutine } from '../routines';
import { QueryClientConfig } from '../types';

export default (queryClient: QueryClient, queryConfig: QueryClientConfig) => {
  const { notifier } = queryConfig;

  queryClient.setMutationDefaults(MUTATION_KEYS.EXPORT_ZIP, {
    mutationFn: ({ id }) => Api.exportItem(id, queryConfig),
    onSuccess: () => {
      notifier?.({ type: exportItemRoutine.SUCCESS });
    },
    onError: (error) => {
      notifier?.({ type: exportItemRoutine.FAILURE, payload: { error } });
    },
  });
  const useExportZip = () =>
    useMutation<Blob, unknown, { id: UUID }>(MUTATION_KEYS.EXPORT_ZIP);

  return {
    useExportZip,
  };
};

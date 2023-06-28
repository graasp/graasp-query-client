import { useMutation } from 'react-query';

import { UUID } from '@graasp/sdk';

import * as Api from '../api';
import { exportItemRoutine } from '../routines';
import { QueryClientConfig } from '../types';

export default (queryConfig: QueryClientConfig) => {
  const { notifier } = queryConfig;

  const useExportZip = () =>
    useMutation(({ id }: { id: UUID }) => Api.exportItem(id, queryConfig), {
      onSuccess: () => {
        notifier?.({ type: exportItemRoutine.SUCCESS });
      },
      onError: (error: Error) => {
        notifier?.({ type: exportItemRoutine.FAILURE, payload: { error } });
      },
    });

  return {
    useExportZip,
  };
};

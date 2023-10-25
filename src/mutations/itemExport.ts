import { UUID } from '@graasp/sdk';

import { useMutation } from 'react-query';

import * as Api from '../api';
import { exportItemRoutine } from '../routines';
import { QueryClientConfig } from '../types';

export default (queryConfig: QueryClientConfig) => {
  const { notifier } = queryConfig;

  const useExportZip = () =>
    useMutation(
      (args: { itemId: UUID; type?: string }) =>
        Api.exportItem(args, queryConfig),
      {
        onSuccess: () => {
          notifier?.({ type: exportItemRoutine.SUCCESS });
        },
        onError: (error: Error) => {
          notifier?.({ type: exportItemRoutine.FAILURE, payload: { error } });
        },
      },
    );

  return {
    useExportZip,
  };
};

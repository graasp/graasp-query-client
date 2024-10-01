import { UUID } from '@graasp/sdk';

import { useMutation } from '@tanstack/react-query';

import * as Api from '../api/itemExport.js';
import { exportItemRoutine } from '../routines/itemExport.js';
import { QueryClientConfig } from '../types.js';

export default (queryConfig: QueryClientConfig) => {
  const { notifier } = queryConfig;

  const useExportItem = () =>
    useMutation({
      mutationFn: ({ id }: { id: UUID }) => Api.exportItem(id, queryConfig),
      onSuccess: () => {
        notifier?.({ type: exportItemRoutine.SUCCESS });
      },
      onError: (error: Error) => {
        notifier?.({ type: exportItemRoutine.FAILURE, payload: { error } });
      },
    });

  return {
    useExportItem,
  };
};

import { useMutation, useQueryClient } from '@tanstack/react-query';

import * as Api from '../api/csvUserImport.js';
import { itemKeys } from '../keys.js';
import { postCsvUserImportRoutine } from '../routines/csvUserImport.js';
import { QueryClientConfig } from '../types.js';

export default (queryConfig: QueryClientConfig) => {
  const useCSVUserImport = () => {
    const queryClient = useQueryClient();
    return useMutation(
      (payload: Api.UploadCSVPayload) =>
        Api.uploadUserCsv(queryConfig, payload),
      {
        onSuccess: () => {
          queryConfig.notifier?.({
            type: postCsvUserImportRoutine.SUCCESS,
          });
        },
        onError: (error: Error) => {
          queryConfig.notifier?.({
            type: postCsvUserImportRoutine.FAILURE,
            payload: { error },
          });
        },
        onSettled: (_data, _error, { itemId }) => {
          queryClient.invalidateQueries(itemKeys.single(itemId).invitation);
          queryClient.invalidateQueries(itemKeys.single(itemId).memberships);
        },
      },
    );
  };

  return {
    useCSVUserImport,
  };
};

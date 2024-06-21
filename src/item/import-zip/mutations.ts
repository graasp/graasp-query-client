import { DiscriminatedItem } from '@graasp/sdk';
import { SUCCESS_MESSAGES } from '@graasp/translations';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosProgressEvent } from 'axios';

import { getKeyForParentId } from '../../keys.js';
import { type QueryClientConfig } from '../../types.js';
import { importZipRoutine } from '../routines.js';
import { importZip } from './api.js';

export const useImportZip = (queryConfig: QueryClientConfig) => () => {
  const queryClient = useQueryClient();
  const { notifier } = queryConfig;
  return useMutation(
    async (args: {
      id?: DiscriminatedItem['id'];
      file: Blob;
      previousItemId?: DiscriminatedItem['id'];
      onUploadProgress?: (progressEvent: AxiosProgressEvent) => void;
    }) => importZip(args, queryConfig),
    {
      onSuccess: () => {
        notifier?.({
          type: importZipRoutine.SUCCESS,
          payload: { message: SUCCESS_MESSAGES.UPLOAD_FILES },
        });
      },
      onError: (error: Error) => {
        notifier?.({
          type: importZipRoutine.FAILURE,
          payload: { error },
        });
      },
      onSettled: (_data, _error, { id }) => {
        const parentKey = getKeyForParentId(id);
        queryClient.invalidateQueries(parentKey);
      },
    },
  );
};

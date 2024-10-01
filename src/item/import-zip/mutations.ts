import { DiscriminatedItem } from '@graasp/sdk';
import { REQUEST_MESSAGES } from '@graasp/translations';

import { useMutation } from '@tanstack/react-query';
import { AxiosProgressEvent } from 'axios';

import { type QueryClientConfig } from '../../types.js';
import { importZipRoutine } from '../routines.js';
import { importZip } from './api.js';

export const useImportZip = (queryConfig: QueryClientConfig) => () => {
  const { notifier } = queryConfig;
  return useMutation({
    mutationFn: async (args: {
      id?: DiscriminatedItem['id'];
      file: Blob;
      onUploadProgress?: (progressEvent: AxiosProgressEvent) => void;
    }) => importZip(args, queryConfig),
    onSuccess: () => {
      // send request notification, async endpoint
      notifier?.({
        type: importZipRoutine.SUCCESS,
        payload: { message: REQUEST_MESSAGES.IMPORT_ZIP },
      });
    },
    onError: (error: Error) => {
      notifier?.({
        type: importZipRoutine.FAILURE,
        payload: { error },
      });
    },
  });
};

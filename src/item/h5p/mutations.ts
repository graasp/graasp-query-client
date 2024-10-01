import { DiscriminatedItem } from '@graasp/sdk';
import { SUCCESS_MESSAGES } from '@graasp/translations';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosProgressEvent } from 'axios';

import { getKeyForParentId } from '../../keys.js';
import { type QueryClientConfig } from '../../types.js';
import { importH5PRoutine } from '../routines.js';
import { importH5P } from './api.js';

export const useImportH5P = (queryConfig: QueryClientConfig) => () => {
  const queryClient = useQueryClient();
  const { notifier } = queryConfig;
  return useMutation({
    mutationFn: async (args: {
      id?: DiscriminatedItem['id'];
      file: Blob;
      previousItemId?: DiscriminatedItem['id'];
      onUploadProgress?: (progressEvent: AxiosProgressEvent) => void;
    }) => importH5P(args, queryConfig),
    onSuccess: () => {
      notifier?.({
        type: importH5PRoutine.SUCCESS,
        payload: { message: SUCCESS_MESSAGES.IMPORT_H5P },
      });
    },
    onError: (error: Error) => {
      notifier?.({
        type: importH5PRoutine.FAILURE,
        payload: { error },
      });
    },
    onSettled: (_data, _error, { id }) => {
      const parentKey = getKeyForParentId(id);
      queryClient.invalidateQueries({ queryKey: parentKey });
    },
  });
};

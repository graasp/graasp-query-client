import { QueryClient } from 'react-query';

import { SUCCESS_MESSAGES } from '@graasp/translations';

import { throwIfArrayContainsErrorOrReturn } from '../api/axios';
import { MUTATION_KEYS, buildItemKey } from '../config/keys';
import { uploadItemThumbnailRoutine } from '../routines';
import { QueryClientConfig } from '../types';

export default (queryClient: QueryClient, queryConfig: QueryClientConfig) => {
  const { notifier } = queryConfig;

  /**
   * @param {UUID} id membership id to edit
   * @param {UUID} itemId corresponding item id
   * @param {PermissionLevel} permission permission level to apply
   */
  queryClient.setMutationDefaults(MUTATION_KEYS.UPLOAD_ITEM_THUMBNAIL, {
    mutationFn: async ({ error, data }) => {
      throwIfArrayContainsErrorOrReturn(data);
      if (error) throw new Error(JSON.stringify(error));
    },
    onSuccess: () => {
      notifier?.({
        type: uploadItemThumbnailRoutine.SUCCESS,
        payload: { message: SUCCESS_MESSAGES.UPLOAD_ITEM_THUMBNAIL },
      });
    },
    onError: (axiosError, { error }) => {
      notifier?.({
        type: uploadItemThumbnailRoutine.FAILURE,
        payload: { error: error ?? axiosError },
      });
    },
    onSettled: (_data, _error, { id }) => {
      // invalidate item to update extra.hasThumbnail
      const key = buildItemKey(id);
      queryClient.invalidateQueries(key);
    },
  });
};

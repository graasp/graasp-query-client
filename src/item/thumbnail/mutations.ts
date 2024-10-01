import { MAX_FILE_SIZE, UUID } from '@graasp/sdk';
import { FAILURE_MESSAGES, SUCCESS_MESSAGES } from '@graasp/translations';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosProgressEvent } from 'axios';

import { itemKeys } from '../../keys.js';
import { type QueryClientConfig } from '../../types.js';
import {
  deleteItemThumbnailRoutine,
  uploadItemThumbnailRoutine,
} from '../routines.js';
import { deleteItemThumbnail, uploadItemThumbnail } from './api.js';

export const useUploadItemThumbnail =
  (queryConfig: QueryClientConfig) => () => {
    const { notifier } = queryConfig;
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (args: {
        id: UUID;
        file: Blob;
        onUploadProgress?: (progressEvent: AxiosProgressEvent) => void;
      }) => {
        if (args.file.size > MAX_FILE_SIZE) {
          throw new Error(FAILURE_MESSAGES.UPLOAD_BIG_FILES);
        }

        return uploadItemThumbnail(args, queryConfig);
      },
      onSuccess: () => {
        notifier?.({
          type: uploadItemThumbnailRoutine.SUCCESS,
          payload: { message: SUCCESS_MESSAGES.UPLOAD_ITEM_THUMBNAIL },
        });
      },
      onError: (error: Error) => {
        notifier?.({
          type: uploadItemThumbnailRoutine.FAILURE,
          payload: { error },
        });
      },
      onSettled: (_data, _error, { id }) => {
        // invalidate item to update settings.hasThumbnail
        queryClient.invalidateQueries({
          queryKey: itemKeys.single(id).content,
        });
        queryClient.invalidateQueries({
          queryKey: itemKeys.single(id).allThumbnails,
        });
      },
    });
  };
/**
 * @deprecated use useUploadItemThumbnail
 * this mutation is used for its callback and invalidate the keys
 * @param {UUID} id parent item id where the file is uploaded in
 * @param {error} [error] error occurred during the file uploading
 */
export const useUploadItemThumbnailFeedback =
  (queryConfig: QueryClientConfig) => () => {
    const queryClient = useQueryClient();
    const { notifier } = queryConfig;
    return useMutation({
      mutationFn:
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        async ({ error }: { id: string; error?: Error; data?: any }) => {
          if (error) throw new Error(JSON.stringify(error));
        },
      onSuccess: () => {
        notifier?.({
          type: uploadItemThumbnailRoutine.SUCCESS,
          payload: { message: SUCCESS_MESSAGES.UPLOAD_ITEM_THUMBNAIL },
        });
      },
      onError: (_error, { error }) => {
        notifier?.({
          type: uploadItemThumbnailRoutine.FAILURE,
          payload: { error },
        });
      },
      onSettled: (_data, _error, { id }) => {
        // invalidate item to update settings.hasThumbnail
        queryClient.invalidateQueries({
          queryKey: itemKeys.single(id).content,
        });
        queryClient.invalidateQueries({
          queryKey: itemKeys.single(id).allThumbnails,
        });
      },
    });
  };

export const useDeleteItemThumbnail =
  (queryConfig: QueryClientConfig) => () => {
    const { notifier } = queryConfig;
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (itemId: UUID) => deleteItemThumbnail(itemId, queryConfig),
      onSuccess: () => {
        notifier?.({
          type: deleteItemThumbnailRoutine.SUCCESS,
          payload: { message: SUCCESS_MESSAGES.DELETE_ITEM_THUMBNAIL },
        });
      },
      onError: (error: Error) => {
        notifier?.({
          type: deleteItemThumbnailRoutine.FAILURE,
          payload: { error },
        });
      },
      onSettled: (_data, _error, id) => {
        // invalidateQueries doesn't invalidate if the query is disabled
        // so reset the query to avoid issues in the frontend (getting dirty cache).
        queryClient.resetQueries({
          queryKey: itemKeys.single(id).allThumbnails,
        });
        // try to invalidate the thumbnail (the invalidateQueries doesn't invalidate disabled queries)
        queryClient.invalidateQueries({
          queryKey: itemKeys.single(id).allThumbnails,
        });
        // invalidate item to update settings.hasThumbnail
        queryClient.invalidateQueries({
          queryKey: itemKeys.single(id).content,
        });
      },
    });
  };

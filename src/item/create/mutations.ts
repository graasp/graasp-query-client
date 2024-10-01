import {
  DiscriminatedItem,
  MAX_FILE_SIZE,
  MAX_NUMBER_OF_FILES_UPLOAD,
  partitionArray,
} from '@graasp/sdk';
import { FAILURE_MESSAGES, SUCCESS_MESSAGES } from '@graasp/translations';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosProgressEvent } from 'axios';

import { throwIfArrayContainsErrorOrReturn } from '../../api/axios.js';
import { getKeyForParentId, itemsWithGeolocationKeys } from '../../keys.js';
import { QueryClientConfig } from '../../types.js';
import {
  PostItemPayloadType,
  PostItemWithThumbnailPayloadType,
} from '../api.js';
import { createItemRoutine, uploadFilesRoutine } from '../routines.js';
import { postItem, postItemWithThumbnail, uploadFiles } from './api.js';

export const usePostItem = (queryConfig: QueryClientConfig) => () => {
  const queryClient = useQueryClient();
  const { notifier } = queryConfig;
  return useMutation({
    mutationFn: async (
      item: PostItemPayloadType | PostItemWithThumbnailPayloadType,
    ) => {
      // check if thumbnail was provided and if it is defined
      if ('thumbnail' in item && item.thumbnail) {
        return postItemWithThumbnail(item, queryConfig);
      }
      return postItem(item, queryConfig);
    },
    //  we cannot optimistically add an item because we need its id
    onSuccess: () => {
      notifier?.({
        type: createItemRoutine.SUCCESS,
        payload: { message: SUCCESS_MESSAGES.CREATE_ITEM },
      });
    },
    onError: (error: Error) => {
      notifier?.({ type: createItemRoutine.FAILURE, payload: { error } });
    },
    onSettled: (_data, _error, { geolocation, parentId }) => {
      const key = getKeyForParentId(parentId);
      queryClient.invalidateQueries({ queryKey: key });

      // if item has geolocation, invalidate map related keys
      if (geolocation) {
        queryClient.invalidateQueries({
          queryKey: itemsWithGeolocationKeys.allBounds,
        });
      }
    },
  });
};

/**
 * @deprecated use useUploadFiles
 * this mutation is used for its callback and invalidate the keys
 * @param {UUID} id parent item id where the file is uploaded in
 * @param {error} [error] error ocurred during the file uploading
 */
export const useUploadFilesFeedback =
  (queryConfig: QueryClientConfig) => () => {
    const queryClient = useQueryClient();
    const { notifier } = queryConfig;
    return useMutation({
      mutationFn:
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        async ({ error, data }: { error?: Error; data?: any; id?: string }) => {
          throwIfArrayContainsErrorOrReturn(data);
          if (error) {
            throw new Error(JSON.stringify(error));
          }
        },
      onSuccess: () => {
        notifier?.({
          type: uploadFilesRoutine.SUCCESS,
          payload: { message: SUCCESS_MESSAGES.UPLOAD_FILES },
        });
      },
      onError: (axiosError: Error, { error }) => {
        notifier?.({
          type: uploadFilesRoutine.FAILURE,
          payload: { error: error ?? axiosError },
        });
      },
      onSettled: (_data, _error, { id }) => {
        const parentKey = getKeyForParentId(id);
        queryClient.invalidateQueries({ queryKey: parentKey });
      },
    });
  };

/**
 * Mutation to upload files
 * bug: currently the backend only support one file at a time, when improving this we need to handle the resultOf's errors
 * @param queryConfig
 */
export const useUploadFiles = (queryConfig: QueryClientConfig) => () => {
  const queryClient = useQueryClient();
  const { notifier } = queryConfig;
  return useMutation({
    mutationFn: async (args: {
      id?: DiscriminatedItem['id'];
      files: File[];
      previousItemId?: DiscriminatedItem['id'];
      onUploadProgress?: (progressEvent: AxiosProgressEvent) => void;
    }) => {
      // filter out big files to not upload them
      const [validFiles, bigFiles] = partitionArray(
        args.files,
        ({ size }) => size < MAX_FILE_SIZE,
      );

      if (bigFiles.length) {
        // we only notify, we can continue with the valid files
        notifier?.({
          type: uploadFilesRoutine.FAILURE,
          payload: {
            error: new Error(FAILURE_MESSAGES.UPLOAD_BIG_FILES),
            data: bigFiles,
          },
        });
      }

      if (!validFiles.length) {
        throw new Error(FAILURE_MESSAGES.UPLOAD_EMPTY_FILE);
      }

      if (validFiles.length > MAX_NUMBER_OF_FILES_UPLOAD) {
        throw new Error(FAILURE_MESSAGES.UPLOAD_TOO_MANY_FILES);
      }

      return uploadFiles({ ...args, files: validFiles }, queryConfig);
    },
    onSuccess: () => {
      notifier?.({
        type: uploadFilesRoutine.SUCCESS,
        payload: { message: SUCCESS_MESSAGES.UPLOAD_FILES },
      });
    },
    onError: (error: Error) => {
      notifier?.({
        type: uploadFilesRoutine.FAILURE,
        payload: { error },
      });
    },
    onSettled: (_data, _error, { id }) => {
      const parentKey = getKeyForParentId(id);
      queryClient.invalidateQueries({ queryKey: parentKey });
    },
  });
};

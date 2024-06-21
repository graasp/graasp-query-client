import { DiscriminatedItem, MAX_FILE_SIZE } from '@graasp/sdk';
import { SUCCESS_MESSAGES } from '@graasp/translations';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosProgressEvent } from 'axios';

import { throwIfArrayContainsErrorOrReturn } from '../../api/axios.js';
import { getKeyForParentId, itemsWithGeolocationKeys } from '../../keys.js';
import { QueryClientConfig } from '../../types.js';
import {
  PostItemPayloadType,
  PostItemWithThumbnailPayloadType,
} from '../api.js';
import { createItemRoutine, uploadFileRoutine } from '../routines.js';
import { postItem, postItemWithThumbnail, uploadFiles } from './api.js';

export const usePostItem = (queryConfig: QueryClientConfig) => () => {
  const queryClient = useQueryClient();
  const { notifier } = queryConfig;
  return useMutation(
    async (item: PostItemPayloadType | PostItemWithThumbnailPayloadType) => {
      // check if thumbnail was provided and if it is defined
      if ('thumbnail' in item && item.thumbnail) {
        return postItemWithThumbnail(item, queryConfig);
      }
      return postItem(item, queryConfig);
    },
    //  we cannot optimistically add an item because we need its id
    {
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
        queryClient.invalidateQueries(key);

        // if item has geolocation, invalidate map related keys
        if (geolocation) {
          queryClient.invalidateQueries(itemsWithGeolocationKeys.allBounds);
        }
      },
    },
  );
};

/**
 * this mutation is used for its callback and invalidate the keys
 * @param {UUID} id parent item id where the file is uploaded in
 * @param {error} [error] error ocurred during the file uploading
 */
export const useUploadFilesFeedback =
  (queryConfig: QueryClientConfig) => () => {
    const queryClient = useQueryClient();
    const { notifier } = queryConfig;
    return useMutation(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      async ({ error, data }: { error?: Error; data?: any; id?: string }) => {
        throwIfArrayContainsErrorOrReturn(data);
        if (error) throw new Error(JSON.stringify(error));
      },
      {
        onSuccess: () => {
          notifier?.({
            type: uploadFileRoutine.SUCCESS,
            payload: { message: SUCCESS_MESSAGES.UPLOAD_FILES },
          });
        },
        onError: (axiosError: Error, { error }) => {
          notifier?.({
            type: uploadFileRoutine.FAILURE,
            payload: { error: error ?? axiosError },
          });
        },
        onSettled: (_data, _error, { id }) => {
          const parentKey = getKeyForParentId(id);
          queryClient.invalidateQueries(parentKey);
        },
      },
    );
  };

export const useUploadFiles = (queryConfig: QueryClientConfig) => () => {
  const queryClient = useQueryClient();
  const { notifier } = queryConfig;
  return useMutation(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async (args: {
      id?: DiscriminatedItem['id'];
      files: File[];
      previousItemId?: DiscriminatedItem['id'];
      onUploadProgress?: (progressEvent: AxiosProgressEvent) => void;
    }) => {
      // cannot upload big files
      const finalFiles = args.files.filter(({ size }) => size < MAX_FILE_SIZE);

      if (!finalFiles.length) {
        throw new Error('no file to upload');
      }
      // TODO: use SDK!!!
      if (finalFiles.length > 20) {
        throw new Error('too many files to upload');
      }

      return uploadFiles(args, queryConfig);
    },
    {
      onSuccess: () => {
        notifier?.({
          type: uploadFileRoutine.SUCCESS,
          payload: { message: SUCCESS_MESSAGES.UPLOAD_FILES },
        });
      },
      onError: (error: Error) => {
        notifier?.({
          type: uploadFileRoutine.FAILURE,
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

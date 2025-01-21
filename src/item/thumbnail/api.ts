import { DiscriminatedItem, UUID } from '@graasp/sdk';

import { AxiosProgressEvent } from 'axios';

import { verifyAuthentication } from '../../api/axios.js';
import { DEFAULT_THUMBNAIL_SIZE } from '../../config/constants.js';
import { PartialQueryConfigForApi } from '../../types.js';
import {
  buildDeleteItemThumbnailRoute,
  buildDownloadItemThumbnailRoute,
  buildUploadItemThumbnailRoute,
} from '../routes.js';

export const downloadItemThumbnailUrl = async (
  { id, size = DEFAULT_THUMBNAIL_SIZE }: { id: UUID; size?: string },
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  axios
    .get<string>(
      `${API_HOST}/${buildDownloadItemThumbnailRoute({
        id,
        size,
        replyUrl: true,
      })}`,
    )
    .then(({ data }) => data);

export const deleteItemThumbnail = async (
  id: UUID,
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  axios
    .delete<void>(`${API_HOST}/${buildDeleteItemThumbnailRoute(id)}`)
    .then(({ data }) => data);

export const uploadItemThumbnail = async (
  args: {
    id: DiscriminatedItem['id'];
    file: Blob;
    onUploadProgress?: (progressEvent: AxiosProgressEvent) => void;
  },
  { API_HOST, axios }: PartialQueryConfigForApi,
): Promise<DiscriminatedItem> =>
  verifyAuthentication(() => {
    const { id, file } = args;
    const itemPayload = new FormData();

    /* WARNING: this file field needs to be the last one,
     * otherwise the normal fields can not be read
     * https://github.com/fastify/fastify-multipart?tab=readme-ov-file#usage
     */
    itemPayload.append('file', file);
    return axios
      .post<DiscriminatedItem>(
        `${API_HOST}/${buildUploadItemThumbnailRoute(id)}`,
        itemPayload,
        {
          headers: { 'Content-Type': 'multipart/form-data' },

          onUploadProgress: (progressEvent) => {
            args.onUploadProgress?.(progressEvent);
          },
        },
      )
      .then(({ data }) => data);
  });

import { UUID } from '@graasp/sdk';

import qs from 'qs';

import { DEFAULT_THUMBNAIL_SIZE } from '../config/constants.js';
import { PaginationParams } from '../types.js';
import { ItemChildrenParams, ItemSearchParams } from './types.js';

export const ITEMS_ROUTE = 'items';
export const GET_OWN_ITEMS_ROUTE = `${ITEMS_ROUTE}/own`;
export const GET_RECYCLED_ITEMS_DATA_ROUTE = `${ITEMS_ROUTE}/recycled`;
export const SHARED_ITEM_WITH_ROUTE = `${ITEMS_ROUTE}/shared-with`;

export const buildGetAccessibleItems = (
  params: ItemSearchParams,
  pagination: PaginationParams,
) =>
  `${ITEMS_ROUTE}/accessible${qs.stringify(
    { ...params, page: 1, ...pagination },
    {
      arrayFormat: 'repeat',
      addQueryPrefix: true,
    },
  )}`;

export const buildPostItemRoute = (parentId?: UUID, previousItemId?: UUID) => {
  const url = ITEMS_ROUTE;
  const params = new URLSearchParams();
  if (parentId) {
    params.set('parentId', parentId);
  }
  if (previousItemId) {
    params.set('previousItemId', previousItemId);
  }
  return `${url}?${params.toString()}`;
};
export const buildPostItemWithThumbnailRoute = (
  parentId?: UUID,
  previousItemId?: UUID,
) => {
  const url = `${ITEMS_ROUTE}/with-thumbnail`;
  const params = new URLSearchParams();
  if (parentId) {
    params.set('parentId', parentId);
  }
  if (previousItemId) {
    params.set('previousItemId', previousItemId);
  }
  return `${url}?${params.toString()}`;
};
export const buildDeleteItemRoute = (id: UUID) => `${ITEMS_ROUTE}/${id}/delete`;
export const buildDeleteItemsRoute = (ids: UUID[]) =>
  `${ITEMS_ROUTE}${qs.stringify(
    { id: ids },
    {
      arrayFormat: 'repeat',
      addQueryPrefix: true,
    },
  )}`;
export const buildGetChildrenRoute = (id: UUID, params: ItemChildrenParams) =>
  `${ITEMS_ROUTE}/${id}/children${qs.stringify(params, {
    arrayFormat: 'repeat',
    addQueryPrefix: true,
  })}`;
export const buildGetItemRoute = (id: UUID) => `${ITEMS_ROUTE}/${id}`;
export const buildGetItemParents = (id: UUID) => `${ITEMS_ROUTE}/${id}/parents`;
export const buildGetItemDescendants = (id: UUID) =>
  `${ITEMS_ROUTE}/${id}/descendants`;
export const buildGetItemsRoute = (ids: UUID[]) =>
  `${ITEMS_ROUTE}?${qs.stringify({ id: ids }, { arrayFormat: 'repeat' })}`;
export const buildMoveItemRoute = (id: UUID) => `${ITEMS_ROUTE}/${id}/move`;
export const buildMoveItemsRoute = (ids: UUID[]) =>
  `${ITEMS_ROUTE}/move?${qs.stringify({ id: ids }, { arrayFormat: 'repeat' })}`;
export const buildCopyItemRoute = (id: UUID) => `${ITEMS_ROUTE}/${id}/copy`;
export const buildCopyItemsRoute = (ids: UUID[]) =>
  `${ITEMS_ROUTE}/copy?${qs.stringify({ id: ids }, { arrayFormat: 'repeat' })}`;
export const buildEditItemRoute = (id: UUID) => `${ITEMS_ROUTE}/${id}`;

export const buildUploadItemThumbnailRoute = (id: UUID) =>
  `${ITEMS_ROUTE}/${id}/thumbnails`;
export const buildDeleteItemThumbnailRoute = (id: UUID) =>
  `${ITEMS_ROUTE}/${id}/thumbnails`;

export const buildDownloadItemThumbnailRoute = ({
  id,
  replyUrl,
  size = DEFAULT_THUMBNAIL_SIZE,
}: {
  id: UUID;
  replyUrl?: boolean;
  size?: string;
}) =>
  `${ITEMS_ROUTE}/${id}/thumbnails/${size}${qs.stringify(
    { replyUrl },
    { addQueryPrefix: true },
  )}`;

export const buildDownloadFilesRoute = (id: UUID) =>
  `${ITEMS_ROUTE}/${id}/download`;
export const buildRecycleItemRoute = (id: UUID) =>
  `${ITEMS_ROUTE}/${id}/recycle`;
export const buildRecycleItemsRoute = (ids: UUID[]) =>
  `${ITEMS_ROUTE}/recycle${qs.stringify(
    { id: ids },
    {
      arrayFormat: 'repeat',
      addQueryPrefix: true,
    },
  )}`;

export const buildRestoreItemsRoute = (ids: UUID[]) =>
  `${ITEMS_ROUTE}/restore${qs.stringify(
    { id: ids },
    {
      arrayFormat: 'repeat',
      addQueryPrefix: true,
    },
  )}`;

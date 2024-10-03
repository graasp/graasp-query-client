import { Pagination, UUID } from '@graasp/sdk';

import { DEFAULT_THUMBNAIL_SIZE } from '../config/constants.js';
import { ItemChildrenParams, ItemSearchParams } from './types.js';

export const ITEMS_ROUTE = 'items';

export const SHARED_ITEM_WITH_ROUTE = `${ITEMS_ROUTE}/shared-with`;

export const setSearchQueryParams = ({
  creatorId,
  ordering,
  sortBy,
  permissions,
  types,
  keywords,
}: ItemSearchParams) => {
  const searchParams = new URLSearchParams();

  // searchParams
  if (creatorId) {
    searchParams.set('creatorId', creatorId);
  }
  if (sortBy) {
    searchParams.set('sortBy', sortBy);
  }
  if (ordering) {
    searchParams.set('ordering', ordering);
  }
  keywords?.split(' ')?.forEach((k) => {
    searchParams.append('keywords', k);
  });
  if (permissions && permissions.length) {
    permissions.forEach((p) => searchParams.append('permissions', p));
  }
  if (types && types.length) {
    types.forEach((t) => searchParams.append('types', t));
  }
  return searchParams;
};

export const buildGetAccessibleItems = (
  params: ItemSearchParams,
  { page, pageSize }: Partial<Pagination>,
) => {
  const searchParams = setSearchQueryParams(params);

  // pagination params
  searchParams.set('page', (page ?? 1).toString());
  if (pageSize) {
    searchParams.set('pageSize', pageSize.toString());
  }

  return `${ITEMS_ROUTE}/accessible?${searchParams}`;
};

export const buildPostItemRoute = (parentId?: UUID, previousItemId?: UUID) => {
  const url = ITEMS_ROUTE;
  const params = new URLSearchParams();
  if (parentId) {
    params.set('parentId', parentId);
  }
  if (previousItemId) {
    params.set('previousItemId', previousItemId);
  }
  return `${url}${params.toString() ? `?${params.toString()}` : ''}`;
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
  return `${url}${params.toString() ? `?${params.toString()}` : ''}`;
};
export const buildDeleteItemRoute = (id: UUID) => `${ITEMS_ROUTE}/${id}/delete`;
export const buildDeleteItemsRoute = (ids: UUID[]) =>
  `${ITEMS_ROUTE}?${new URLSearchParams(ids.map((id) => ['id', id]))}`;

export const buildGetChildrenRoute = (
  id: UUID,
  { ordered, types, keywords }: ItemChildrenParams,
) => {
  const route = `${ITEMS_ROUTE}/${id}/children`;
  const search = new URLSearchParams();
  if (ordered) {
    search.set('ordered', ordered.toString());
  }
  if (types?.length) {
    types.forEach((t) => search.append('types', t));
  }
  if (keywords?.length) {
    keywords.split(' ')?.forEach((k) => {
      search.append('keywords', k);
    });
  }
  if (search.toString()) {
    return `${route}?${search}`;
  }
  return route;
};
export const buildGetItemRoute = (id: UUID) => `${ITEMS_ROUTE}/${id}`;
export const buildGetItemParents = (id: UUID) => `${ITEMS_ROUTE}/${id}/parents`;
export const buildGetItemDescendants = (id: UUID) =>
  `${ITEMS_ROUTE}/${id}/descendants`;
export const buildGetItemsRoute = (ids: UUID[]) =>
  `${ITEMS_ROUTE}?${new URLSearchParams(ids.map((id) => ['id', id]))}`;
export const buildMoveItemRoute = (id: UUID) => `${ITEMS_ROUTE}/${id}/move`;
export const buildMoveItemsRoute = (ids: UUID[]) =>
  `${ITEMS_ROUTE}/move?${new URLSearchParams(ids.map((id) => ['id', id]))}`;
export const buildCopyItemRoute = (id: UUID) => `${ITEMS_ROUTE}/${id}/copy`;
export const buildCopyItemsRoute = (ids: UUID[]) =>
  `${ITEMS_ROUTE}/copy?${new URLSearchParams(ids.map((id) => ['id', id]))}`;
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
}) => {
  const route = `${ITEMS_ROUTE}/${id}/thumbnails/${size}`;
  if (replyUrl) {
    return `${route}?${new URLSearchParams({ replyUrl: replyUrl.toString() })}`;
  }
  return route;
};

export const buildDownloadFilesRoute = (id: UUID) =>
  `${ITEMS_ROUTE}/${id}/download`;
export const buildRecycleItemRoute = (id: UUID) =>
  `${ITEMS_ROUTE}/${id}/recycle`;
export const buildRecycleItemsRoute = (ids: UUID[]) =>
  `${ITEMS_ROUTE}/recycle?${new URLSearchParams(ids.map((id) => ['id', id]))}`;

export const buildRestoreItemsRoute = (ids: UUID[]) =>
  `${ITEMS_ROUTE}/restore?${new URLSearchParams(ids.map((id) => ['id', id]))}`;

export const buildReorderItemRoute = (args: { id: string }) =>
  `${ITEMS_ROUTE}/${args.id}/reorder`;

export const buildUploadFilesRoute = (
  parentId?: UUID,
  previousItemId?: UUID,
) => {
  const route = `${ITEMS_ROUTE}/upload`;
  const query = new URLSearchParams();
  if (parentId) {
    query.set('id', parentId);
  }
  if (previousItemId) {
    query.set('previousItemId', previousItemId);
  }
  if (query.toString()) {
    return `${route}?${query.toString()}`;
  }
  return route;
};

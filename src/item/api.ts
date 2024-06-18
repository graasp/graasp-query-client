import {
  DiscriminatedItem,
  ItemGeolocation,
  PackedItem,
  PackedRecycledItemData,
  ResultOf,
  UUID,
  getParentFromPath,
} from '@graasp/sdk';

import { verifyAuthentication } from '../api/axios.js';
import { DEFAULT_THUMBNAIL_SIZE } from '../config/constants.js';
import { PartialQueryConfigForApi } from '../types.js';
import {
  GET_OWN_ITEMS_ROUTE,
  GET_RECYCLED_ITEMS_DATA_ROUTE,
  ItemChildrenParams,
  SHARED_ITEM_WITH_ROUTE,
  buildCopyItemsRoute,
  buildDeleteItemThumbnailRoute,
  buildDeleteItemsRoute,
  buildDownloadFilesRoute,
  buildDownloadItemThumbnailRoute,
  buildEditItemRoute,
  buildGetChildrenRoute,
  buildGetItemParents,
  buildGetItemRoute,
  buildGetItemsRoute,
  buildMoveItemsRoute,
  buildPostItemRoute,
  buildPostItemWithThumbnailRoute,
  buildRecycleItemsRoute,
  buildRestoreItemsRoute,
} from './routes.js';

export const getItem = (
  id: UUID,
  { API_HOST, axios }: PartialQueryConfigForApi,
): Promise<PackedItem> =>
  axios
    .get<PackedItem>(`${API_HOST}/${buildGetItemRoute(id)}`)
    .then(({ data }) => data);

export const getItems = async (
  ids: UUID[],
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  axios
    .get<ResultOf<PackedItem>>(`${API_HOST}/${buildGetItemsRoute(ids)}`)
    .then(({ data }) => data);

export const getOwnItems = async ({
  API_HOST,
  axios,
}: PartialQueryConfigForApi) =>
  verifyAuthentication(() =>
    axios
      .get<DiscriminatedItem[]>(`${API_HOST}/${GET_OWN_ITEMS_ROUTE}`)
      .then(({ data }) => data),
  );

export type PostItemPayloadType = Partial<DiscriminatedItem> &
  Pick<DiscriminatedItem, 'type' | 'name'> &
  Partial<{
    parentId: UUID;
    geolocation: Pick<ItemGeolocation, 'lat' | 'lng'>;
  }>;
export type PostItemWithThumbnailPayloadType = PostItemPayloadType & {
  thumbnail: Blob;
};

// payload = {name, type, description, extra, geolocation}
// querystring = {parentId}
export const postItem = async (
  {
    name,
    displayName,
    type,
    description,
    extra,
    parentId,
    geolocation,
    settings,
  }: PostItemPayloadType,
  { API_HOST, axios }: PartialQueryConfigForApi,
): Promise<DiscriminatedItem> =>
  verifyAuthentication(() =>
    axios
      .post<DiscriminatedItem>(`${API_HOST}/${buildPostItemRoute(parentId)}`, {
        name: name.trim(),
        displayName: displayName?.trim() ?? name.trim(),
        type,
        description,
        extra,
        geolocation,
        settings,
      })
      .then(({ data }) => data),
  );

export const postItemWithThumbnail = async (
  {
    name,
    displayName,
    type,
    description,
    extra,
    parentId,
    geolocation,
    settings,
    thumbnail,
  }: PostItemWithThumbnailPayloadType,
  { API_HOST, axios }: PartialQueryConfigForApi,
): Promise<DiscriminatedItem> =>
  verifyAuthentication(() => {
    const itemPayload = new FormData();
    // name and type are required
    itemPayload.append('name', name);
    itemPayload.append('type', type);
    if (displayName) {
      itemPayload.append('displayName', displayName);
    }
    if (description) {
      itemPayload.append('description', description);
    }
    if (geolocation) {
      itemPayload.append('geolocation', JSON.stringify(geolocation));
    }
    if (settings) {
      itemPayload.append('settings', JSON.stringify(settings));
    }
    if (extra) {
      itemPayload.append('extra', JSON.stringify(extra));
    }
    /* WARNING: this file field needs to be the last one,
     * otherwise the normal fields can not be read
     * https://github.com/fastify/fastify-multipart?tab=readme-ov-file#usage
     */
    itemPayload.append('file', thumbnail);
    return axios
      .post<DiscriminatedItem>(
        `${API_HOST}/${buildPostItemWithThumbnailRoute(parentId)}`,
        itemPayload,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        },
      )
      .then(({ data }) => data);
  });

export const deleteItems = async (
  ids: UUID[],
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  verifyAuthentication(() =>
    axios
      .delete<void>(`${API_HOST}/${buildDeleteItemsRoute(ids)}`)
      .then(({ data }) => data),
  );

// payload = {name, type, description, extra}
// querystring = {parentId}
export const editItem = async (
  id: UUID,
  item: Pick<DiscriminatedItem, 'id'> &
    Partial<
      Pick<
        DiscriminatedItem,
        'name' | 'displayName' | 'description' | 'extra' | 'settings'
      >
    >,
  { API_HOST, axios }: PartialQueryConfigForApi,
): Promise<DiscriminatedItem> =>
  verifyAuthentication(() =>
    axios
      .patch<DiscriminatedItem>(`${API_HOST}/${buildEditItemRoute(id)}`, {
        ...item,
        name: item.name?.trim(),
        displayName: item.displayName?.trim() ?? item.name?.trim(),
      })
      .then(({ data }) => data),
  );

export const getChildren = async (
  id: UUID,
  params: ItemChildrenParams,
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  axios
    .get<PackedItem[]>(`${API_HOST}/${buildGetChildrenRoute(id, params)}`)
    .then(({ data }) => data);

export const getParents = async (
  { id, path }: { id: UUID; path?: string },
  { API_HOST, axios }: PartialQueryConfigForApi,
) => {
  // shortcut to prevent fetching parents if path shows that item is a root
  if (path) {
    const parentId = getParentFromPath(path);
    if (!parentId) {
      return [];
    }
  }
  return axios
    .get<PackedItem[]>(`${API_HOST}/${buildGetItemParents(id)}`)
    .then(({ data }) => data);
};

export const moveItems = async (
  {
    to,
    ids,
  }: {
    ids: UUID[];
    to?: UUID;
  },
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  verifyAuthentication(() => {
    // send parentId if defined
    const body = { ...(to && { parentId: to }) };
    return axios
      .post<void>(`${API_HOST}/${buildMoveItemsRoute(ids)}`, {
        ...body,
      })
      .then(({ data }) => data);
  });

export const copyItems = async (
  {
    ids,
    to,
  }: {
    ids: UUID[];
    to?: UUID;
  },
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  verifyAuthentication(() => {
    // send parentId if defined
    const body = { ...(to && { parentId: to }) };
    return axios
      .post<void>(`${API_HOST}/${buildCopyItemsRoute(ids)}`, {
        ...body,
      })
      .then(({ data }) => data);
  });

export const getSharedItems = async ({
  API_HOST,
  axios,
}: PartialQueryConfigForApi) =>
  verifyAuthentication(() =>
    axios
      .get<DiscriminatedItem[]>(`${API_HOST}/${SHARED_ITEM_WITH_ROUTE}`, {})
      .then(({ data }) => data),
  );

export const getFileContent = async (
  id: UUID,
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  axios
    .get<Blob>(`${API_HOST}/${buildDownloadFilesRoute(id)}`, {
      responseType: 'blob',
    })
    .then(({ data }) => data);

export const getFileContentUrl = async (
  id: UUID,
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  axios
    .get<string>(`${API_HOST}/${buildDownloadFilesRoute(id)}`, {
      params: {
        replyUrl: true,
      },
    })
    .then(({ data }) => data);

export const getRecycledItemsData = async ({
  API_HOST,
  axios,
}: PartialQueryConfigForApi) =>
  verifyAuthentication(() =>
    axios
      .get<
        PackedRecycledItemData[]
      >(`${API_HOST}/${GET_RECYCLED_ITEMS_DATA_ROUTE}`)
      .then(({ data }) => data),
  );

export const recycleItems = async (
  ids: UUID[],
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  verifyAuthentication(() =>
    axios
      .post<void>(`${API_HOST}/${buildRecycleItemsRoute(ids)}`)
      .then(({ data }) => data),
  );

export const restoreItems = async (
  itemIds: UUID[],
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  verifyAuthentication(() =>
    axios
      .post<void>(`${API_HOST}/${buildRestoreItemsRoute(itemIds)}`)
      .then(({ data }) => data),
  );

export const downloadItemThumbnail = async (
  { id, size = DEFAULT_THUMBNAIL_SIZE }: { id: UUID; size?: string },
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  axios
    .get<Blob>(
      `${API_HOST}/${buildDownloadItemThumbnailRoute({
        id,
        size,
        replyUrl: false,
      })}`,
      {
        responseType: 'blob',
      },
    )
    .then(({ data }) => data);

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

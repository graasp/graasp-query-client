import {
  DiscriminatedItem,
  Item,
  RecycledItemData,
  ResultOf,
  UUID,
} from '@graasp/sdk';

import { DEFAULT_THUMBNAIL_SIZE } from '../config/constants';
import { PartialQueryConfigForApi } from '../types';
import { getParentsIdsFromPath } from '../utils/item';
import { verifyAuthentication } from './axios';
import {
  GET_OWN_ITEMS_ROUTE,
  GET_RECYCLED_ITEMS_DATA_ROUTE,
  SHARED_ITEM_WITH_ROUTE,
  buildCopyItemsRoute,
  buildDeleteItemsRoute,
  buildDownloadFilesRoute,
  buildDownloadItemThumbnailRoute,
  buildEditItemRoute,
  buildGetChildrenRoute,
  buildGetItemDescendants,
  buildGetItemParents,
  buildGetItemRoute,
  buildGetItemsRoute,
  buildMoveItemsRoute,
  buildPostItemRoute,
  buildRecycleItemsRoute,
  buildRestoreItemsRoute,
} from './routes';

export const getItem = (
  id: UUID,
  { API_HOST, axios }: PartialQueryConfigForApi,
) => axios.get(`${API_HOST}/${buildGetItemRoute(id)}`).then(({ data }) => data);

export const getItems = async (
  ids: UUID[],
  { API_HOST, axios }: PartialQueryConfigForApi,
): Promise<ResultOf<Item>> =>
  axios.get(`${API_HOST}/${buildGetItemsRoute(ids)}`).then(({ data }) => data);

export const getOwnItems = async ({
  API_HOST,
  axios,
}: PartialQueryConfigForApi) =>
  verifyAuthentication(() =>
    axios.get(`${API_HOST}/${GET_OWN_ITEMS_ROUTE}`).then(({ data }) => data),
  );

export type PostItemPayloadType = Partial<DiscriminatedItem> &
  Pick<DiscriminatedItem, 'type' | 'name'> & {
    parentId?: UUID;
  };
// payload = {name, type, description, extra}
// querystring = {parentId}
export const postItem = async (
  { name, type, description, extra, parentId }: PostItemPayloadType,
  { API_HOST, axios }: PartialQueryConfigForApi,
): Promise<DiscriminatedItem> =>
  verifyAuthentication(() =>
    axios
      .post(`${API_HOST}/${buildPostItemRoute(parentId)}`, {
        name: name.trim(),
        type,
        description,
        extra,
      })
      .then(({ data }) => data),
  );

export const deleteItems = async (
  ids: UUID[],
  { API_HOST, axios }: PartialQueryConfigForApi,
): Promise<void> =>
  verifyAuthentication(() =>
    axios
      .delete(`${API_HOST}/${buildDeleteItemsRoute(ids)}`)
      .then(({ data }) => data),
  );

// payload = {name, type, description, extra}
// querystring = {parentId}
export const editItem = async (
  id: UUID,
  item: Partial<Item>,
  { API_HOST, axios }: PartialQueryConfigForApi,
): Promise<DiscriminatedItem> =>
  verifyAuthentication(() =>
    axios
      .patch(`${API_HOST}/${buildEditItemRoute(id)}`, {
        ...item,
        name: item.name?.trim(),
      })
      .then(({ data }) => data),
  );

export const getChildren = async (
  id: UUID,
  // eslint-disable-next-line default-param-last
  ordered = true,
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  axios
    .get(`${API_HOST}/${buildGetChildrenRoute(id, ordered)}`)
    .then(({ data }) => data);

export const getParents = async (
  { id, path }: { id: UUID; path?: string },
  { API_HOST, axios }: PartialQueryConfigForApi,
): Promise<Item[]> => {
  // shortcut to prevent fetching parents if path shows that item is a root
  if (path) {
    const parentIds = getParentsIdsFromPath(path, { ignoreSelf: true });
    if (!parentIds.length) {
      return [];
    }
  }
  return axios
    .get(`${API_HOST}/${buildGetItemParents(id)}`)
    .then(({ data }) => data);
};

export const getDescendants = async (
  { id }: { id: UUID },
  { API_HOST, axios }: PartialQueryConfigForApi,
): Promise<Item[]> =>
  axios
    .get(`${API_HOST}/${buildGetItemDescendants(id)}`)
    .then(({ data }) => data);

export const moveItems = async (
  {
    to,
    ids,
  }: {
    ids: UUID[];
    to?: UUID;
  },
  { API_HOST, axios }: PartialQueryConfigForApi,
): Promise<void> =>
  verifyAuthentication(() => {
    // send parentId if defined
    const body = { ...(to && { parentId: to }) };
    return axios
      .post(`${API_HOST}/${buildMoveItemsRoute(ids)}`, {
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
): Promise<void> =>
  verifyAuthentication(() => {
    // send parentId if defined
    const body = { ...(to && { parentId: to }) };
    return axios.post(`${API_HOST}/${buildCopyItemsRoute(ids)}`, {
      ...body,
    });
  });

export const getSharedItems = async ({
  API_HOST,
  axios,
}: PartialQueryConfigForApi) =>
  verifyAuthentication(() =>
    axios
      .get<Item[]>(`${API_HOST}/${SHARED_ITEM_WITH_ROUTE}`, {})
      .then(({ data }) => data),
  );

export const getFileContent = async (
  id: UUID,
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  axios
    .get(`${API_HOST}/${buildDownloadFilesRoute(id)}`, {
      responseType: 'blob',
    })
    .then(({ data }) => data);

export const getFileContentUrl = async (
  id: UUID,
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  axios
    .get(`${API_HOST}/${buildDownloadFilesRoute(id)}`, {
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
      .get<RecycledItemData[]>(`${API_HOST}/${GET_RECYCLED_ITEMS_DATA_ROUTE}`)
      .then(({ data }) => data),
  );

export const recycleItems = async (
  ids: UUID[],
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  verifyAuthentication(() =>
    axios
      .post(`${API_HOST}/${buildRecycleItemsRoute(ids)}`)
      .then(({ data }) => data),
  );

export const restoreItems = async (
  itemIds: UUID[],
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  verifyAuthentication(() =>
    axios
      .post(`${API_HOST}/${buildRestoreItemsRoute(itemIds)}`)
      .then(({ data }) => data),
  );

export const downloadItemThumbnail = async (
  { id, size = DEFAULT_THUMBNAIL_SIZE }: { id: UUID; size?: string },
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  axios
    .get(
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
    .get(
      `${API_HOST}/${buildDownloadItemThumbnailRoute({
        id,
        size,
        replyUrl: true,
      })}`,
    )
    .then(({ data }) => data);

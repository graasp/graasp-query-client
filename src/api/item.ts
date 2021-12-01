import axios from 'axios';
import {
  buildCopyItemRoute,
  buildCopyItemsRoute,
  buildCopyPublicItemRoute,
  buildDeleteItemRoute,
  buildDeleteItemsRoute,
  buildDownloadFilesRoute,
  buildDownloadItemThumbnailRoute,
  buildDownloadPublicItemThumbnailRoute,
  buildEditItemRoute,
  buildGetChildrenRoute,
  buildGetItemRoute,
  buildGetItemsRoute,
  buildGetPublicChildrenRoute,
  buildGetPublicItemRoute,
  buildGetPublicItemsWithTag,
  buildMoveItemRoute,
  buildMoveItemsRoute,
  buildPostItemRoute,
  buildPublicDownloadFilesRoute,
  buildRecycleItemRoute,
  buildRecycleItemsRoute,
  buildRestoreItemsRoute,
  GET_OWN_ITEMS_ROUTE,
  GET_RECYCLED_ITEMS_ROUTE,
  SHARE_ITEM_WITH_ROUTE,
} from './routes';
import { getParentsIdsFromPath } from '../utils/item';
import { ExtendedItem, Item, QueryClientConfig, UUID } from '../types';
import {
  DEFAULT_THUMBNAIL_SIZES,
  FALLBACK_TO_PUBLIC_FOR_STATUS_CODES,
} from '../config/constants';

export const getItem = (
  id: UUID,
  options: { withMemberships?: boolean },
  { API_HOST }: QueryClientConfig,
) =>
  axios
    .get(`${API_HOST}/${buildGetItemRoute(id, options)}`, {
      withCredentials: true,
    })
    .then(({ data }) => data)
    .catch((e) => {
      if (FALLBACK_TO_PUBLIC_FOR_STATUS_CODES.includes(e.response.status)) {
        // try to fetch public items if cannot access privately
        return axios
          .get(`${API_HOST}/${buildGetPublicItemRoute(id, options)}`, {
            withCredentials: true,
          })
          .then(({ data: d }) => d)
          .catch(() => {
            throw new Error(e.response?.statusText);
          });
      }

      throw new Error(e.response?.statusText);
    });

export const getItems = async (ids: UUID[], { API_HOST }: QueryClientConfig) =>
  axios
    .get(`${API_HOST}/${buildGetItemsRoute(ids)}`, {
      withCredentials: true,
    })
    .then(({ data }) => data);

export const getOwnItems = async ({ API_HOST }: QueryClientConfig) =>
  axios
    .get(`${API_HOST}/${GET_OWN_ITEMS_ROUTE}`, {
      withCredentials: true,
    })
    .then(({ data }) => data);

// payload = {name, type, description, extra}
// querystring = {parentId}
export const postItem = async (
  { name, type, description, extra, parentId }: ExtendedItem,
  { API_HOST }: QueryClientConfig,
) =>
  axios
    .post(`${API_HOST}/${buildPostItemRoute(parentId)}`, {
      withCredentials: true,
      name: name.trim(),
      type,
      description,
      extra,
    })
    .then(({ data }) => data);

export const deleteItem = async (id: UUID, { API_HOST }: QueryClientConfig) =>
  axios
    .delete(`${API_HOST}/${buildDeleteItemRoute(id)}`, {
      withCredentials: true,
    })
    .then(({ data }) => data);

export const deleteItems = async (
  ids: UUID[],
  { API_HOST }: QueryClientConfig,
) =>
  axios
    .delete(`${API_HOST}/${buildDeleteItemsRoute(ids)}`, {
      withCredentials: true,
    })
    .then(({ data }) => data);

// payload = {name, type, description, extra}
// querystring = {parentId}
export const editItem = async (
  id: UUID,
  item: Partial<Item>,
  { API_HOST }: QueryClientConfig,
) =>
  axios
    .patch(`${API_HOST}/${buildEditItemRoute(id)}`, {
      withCredentials: true,
      ...item,
      name: item.name?.trim(),
    })
    .then(({ data }) => data);

export const getChildren = async (
  id: UUID,
  ordered = true,
  { API_HOST }: QueryClientConfig,
) =>
  axios
    .get(`${API_HOST}/${buildGetChildrenRoute(id, ordered)}`, {
      withCredentials: true,
    })
    .then(({ data }) => data)
    .catch((e) => {
      if (FALLBACK_TO_PUBLIC_FOR_STATUS_CODES.includes(e.response.status)) {
        // try to fetch public items if cannot access privately
        return axios
          .get(`${API_HOST}/${buildGetPublicChildrenRoute(id, ordered)}`, {
            withCredentials: true,
          })
          .then(({ data: d }) => d);
      }

      throw e;
    });

export const getParents = async (
  { path }: { path: string },
  config: QueryClientConfig,
) => {
  const parentIds = getParentsIdsFromPath(path, { ignoreSelf: true });
  if (parentIds.length) {
    return Promise.all(parentIds.map((id) => getItem(id, {}, config)));
  }
  return [];
};

export const moveItem = async (
  { to, id }: { id: UUID; to: UUID },
  { API_HOST }: QueryClientConfig,
) => {
  // send parentId if defined
  const body = { ...(to && { parentId: to }) };
  return axios
    .post(`${API_HOST}/${buildMoveItemRoute(id)}`, {
      withCredentials: true,
      ...body,
    })
    .then(({ data }) => data);
};

export const moveItems = async (
  { to, id }: { id: UUID[]; to: UUID },
  { API_HOST }: QueryClientConfig,
) => {
  // send parentId if defined
  const body = { ...(to && { parentId: to }) };
  return axios
    .post(`${API_HOST}/${buildMoveItemsRoute(id)}`, {
      withCredentials: true,
      ...body,
    })
    .then(({ data }) => data);
};

export const copyItem = async (
  { id, to }: { id: UUID; to: UUID },
  { API_HOST }: QueryClientConfig,
) => {
  // send parentId if defined
  const body = { ...(to && { parentId: to }) };
  return axios
    .post(`${API_HOST}/${buildCopyItemRoute(id)}`, {
      withCredentials: true,
      ...body,
    })
    .then(({ data }) => data);
};

export const copyPublicItem = async (
  { id, to }: { id: UUID; to: UUID },
  { API_HOST }: QueryClientConfig,
) => {
  // send parentId if defined
  const body = { ...(to && { parentId: to }) };
  return axios
    .post(`${API_HOST}/${buildCopyPublicItemRoute(id)}`, {
      withCredentials: true,
      ...body,
    })
    .then(({ data }) => data);
};

export const copyItems = async (
  { id, to }: { id: UUID[]; to: UUID },
  { API_HOST }: QueryClientConfig,
) => {
  // send parentId if defined
  const body = { ...(to && { parentId: to }) };
  return axios
    .post(`${API_HOST}/${buildCopyItemsRoute(id)}`, {
      withCredentials: true,
      ...body,
    })
    .then(({ data }) => data);
};

export const getSharedItems = async ({ API_HOST }: QueryClientConfig) =>
  axios
    .get(`${API_HOST}/${SHARE_ITEM_WITH_ROUTE}`, {
      withCredentials: true,
    })
    .then(({ data }) => data);

export const getFileContent = async (
  { id }: { id: UUID },
  { API_HOST }: QueryClientConfig,
) =>
  axios
    .get(`${API_HOST}/${buildDownloadFilesRoute(id)}`, {
      withCredentials: true,
      responseType: 'blob',
    })
    .then(({ data }) => data)
    .catch((e) => {
      if (FALLBACK_TO_PUBLIC_FOR_STATUS_CODES.includes(e.response.status)) {
        // try to fetch public items if cannot access privately
        return axios
          .get(`${API_HOST}/${buildPublicDownloadFilesRoute(id)}`, {
            responseType: 'blob',
          })
          .then(({ data }) => data);
      }

      throw e;
    });

export const getRecycledItems = async ({ API_HOST }: QueryClientConfig) =>
  axios
    .get(`${API_HOST}/${GET_RECYCLED_ITEMS_ROUTE}`, {
      withCredentials: true,
    })
    .then(({ data }) => data);

export const recycleItem = async (id: UUID, { API_HOST }: QueryClientConfig) =>
  axios
    .post(`${API_HOST}/${buildRecycleItemRoute(id)}`, {
      withCredentials: true,
    })
    .then(({ data }) => data);

export const recycleItems = async (
  ids: UUID[],
  { API_HOST }: QueryClientConfig,
) =>
  axios
    .post(`${API_HOST}/${buildRecycleItemsRoute(ids)}`, {
      withCredentials: true,
    })
    .then(({ data }) => data);

export const getPublicItemsWithTag = async (
  options: { tagId: UUID; withMemberships?: boolean },
  { API_HOST }: QueryClientConfig,
) =>
  axios
    .get(`${API_HOST}/${buildGetPublicItemsWithTag(options)}`, {
      withCredentials: true,
    })
    .then(({ data }) => data);

export const restoreItems = async (
  itemIds: UUID[],
  { API_HOST }: QueryClientConfig,
) =>
  axios
    .post(`${API_HOST}/${buildRestoreItemsRoute(itemIds)}`, {
      withCredentials: true,
    })
    .then(({ data }) => data);

export const downloadItemThumbnail = async (
  { id, size = DEFAULT_THUMBNAIL_SIZES }: { id: UUID; size?: string },
  { API_HOST }: QueryClientConfig,
) =>
  axios.get(
    `${API_HOST}/${buildDownloadItemThumbnailRoute({ id, size })}`,
    { withCredentials: true, }
  ).then(({ data }) => data).catch(e => {
    if (FALLBACK_TO_PUBLIC_FOR_STATUS_CODES.includes(e.response.status)) {
      return axios.get(
        `${API_HOST}/${buildDownloadPublicItemThumbnailRoute({ id, size })}`,
        { withCredentials: true },
      ).then(({ data }) => data)
    }

    throw e
  });

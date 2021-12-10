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
import {
  DEFAULT_DELETE,
  DEFAULT_GET,
  DEFAULT_PATCH,
  DEFAULT_POST,
  failOnError,
} from './utils';
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

export const getItems = async (
  ids: UUID[],
  { API_HOST }: QueryClientConfig,
) => {
  const res = await fetch(
    `${API_HOST}/${buildGetItemsRoute(ids)}`,
    DEFAULT_GET,
  ).then(failOnError);
  const items = await res.json();
  return items;
};

export const getOwnItems = async ({ API_HOST }: QueryClientConfig) => {
  const res = await fetch(
    `${API_HOST}/${GET_OWN_ITEMS_ROUTE}`,
    DEFAULT_GET,
  ).then(failOnError);

  return res.json();
};

// payload = {name, type, description, extra}
// querystring = {parentId}
export const postItem = async (
  { name, type, description, extra, parentId }: ExtendedItem,
  { API_HOST }: QueryClientConfig,
) => {
  const res = await fetch(`${API_HOST}/${buildPostItemRoute(parentId)}`, {
    ...DEFAULT_POST,
    body: JSON.stringify({ name: name.trim(), type, description, extra }),
  }).then(failOnError);

  const newItem = await res.json();

  return newItem;
};

export const deleteItem = async (id: UUID, { API_HOST }: QueryClientConfig) => {
  const res = await fetch(
    `${API_HOST}/${buildDeleteItemRoute(id)}`,
    DEFAULT_DELETE,
  ).then(failOnError);

  return res.json();
};

export const deleteItems = async (
  ids: UUID[],
  { API_HOST }: QueryClientConfig,
) => {
  const res = await fetch(
    `${API_HOST}/${buildDeleteItemsRoute(ids)}`,
    DEFAULT_DELETE,
  ).then(failOnError);

  return res.json();
};

// payload = {name, type, description, extra}
// querystring = {parentId}
export const editItem = async (
  id: UUID,
  item: Partial<Item>,
  { API_HOST }: QueryClientConfig,
) => {
  const req = await fetch(`${API_HOST}/${buildEditItemRoute(id)}`, {
    ...DEFAULT_PATCH,
    body: JSON.stringify({
      ...item,
      name: item.name?.trim(),
    }),
  }).then(failOnError);

  const newItem = await req.json();
  return newItem;
};

export const getChildren = async (
  id: UUID,
  ordered = true,
  { API_HOST }: QueryClientConfig,
) => {
  let res = await fetch(
    `${API_HOST}/${buildGetChildrenRoute(id, ordered)}`,
    DEFAULT_GET,
  );

  // try to fetch public items if cannot access privately
  if (FALLBACK_TO_PUBLIC_FOR_STATUS_CODES.includes(res.status)) {
    res = await fetch(
      `${API_HOST}/${buildGetPublicChildrenRoute(id, ordered)}`,
      DEFAULT_GET,
    ).then(failOnError);
  }
  if (!res.ok) {
    throw new Error(res.statusText);
  }

  const children = await res.json();

  return children;
};

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
  const res = await fetch(`${API_HOST}/${buildMoveItemRoute(id)}`, {
    ...DEFAULT_POST,
    body: JSON.stringify(body),
  }).then(failOnError);

  return res.ok;
};

export const moveItems = async (
  { to, id }: { id: UUID[]; to: UUID },
  { API_HOST }: QueryClientConfig,
) => {
  // send parentId if defined
  const body = { ...(to && { parentId: to }) };
  const res = await fetch(`${API_HOST}/${buildMoveItemsRoute(id)}`, {
    ...DEFAULT_POST,
    body: JSON.stringify(body),
  }).then(failOnError);

  return res.ok;
};

export const copyItem = async (
  { id, to }: { id: UUID; to: UUID },
  { API_HOST }: QueryClientConfig,
) => {
  // send parentId if defined
  const body = { ...(to && { parentId: to }) };
  const res = await fetch(`${API_HOST}/${buildCopyItemRoute(id)}`, {
    ...DEFAULT_POST,
    body: JSON.stringify(body),
  }).then(failOnError);

  const newItem = await res.json();

  return newItem;
};

export const copyPublicItem = async (
  { id, to }: { id: UUID; to: UUID },
  { API_HOST }: QueryClientConfig,
) => {
  // send parentId if defined
  const body = { ...(to && { parentId: to }) };
  const res = await fetch(`${API_HOST}/${buildCopyPublicItemRoute(id)}`, {
    ...DEFAULT_POST,
    body: JSON.stringify(body),
  }).then(failOnError);

  const newItem = await res.json();

  return newItem;
};

export const copyItems = async (
  { id, to }: { id: UUID[]; to: UUID },
  { API_HOST }: QueryClientConfig,
) => {
  // send parentId if defined
  const body = { ...(to && { parentId: to }) };
  const res = await fetch(`${API_HOST}/${buildCopyItemsRoute(id)}`, {
    ...DEFAULT_POST,
    body: JSON.stringify(body),
  }).then(failOnError);

  const newItems = await res.json();

  return newItems;
};

export const getSharedItems = async ({ API_HOST }: QueryClientConfig) => {
  const res = await fetch(`${API_HOST}/${SHARE_ITEM_WITH_ROUTE}`, {
    ...DEFAULT_GET,
  }).then(failOnError);

  return res.json();
};

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
          .then(({ data }) => data)
          .catch(() => {
            throw new Error(e.response?.statusText);
          });
      }

      throw new Error(e.response?.statusText);
    });

export const getRecycledItems = async ({ API_HOST }: QueryClientConfig) => {
  const res = await fetch(
    `${API_HOST}/${GET_RECYCLED_ITEMS_ROUTE}`,
    DEFAULT_GET,
  ).then(failOnError);
  const items = await res.json();
  return items;
};

export const recycleItem = async (
  id: UUID,
  { API_HOST }: QueryClientConfig,
) => {
  const res = await fetch(`${API_HOST}/${buildRecycleItemRoute(id)}`, {
    ...DEFAULT_POST,
    headers: {},
  }).then(failOnError);

  return res.ok;
};

export const recycleItems = async (
  ids: UUID[],
  { API_HOST }: QueryClientConfig,
) => {
  const res = await fetch(`${API_HOST}/${buildRecycleItemsRoute(ids)}`, {
    ...DEFAULT_POST,
    headers: {},
  }).then(failOnError);

  return res.ok;
};

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
) => {
  const res = await fetch(`${API_HOST}/${buildRestoreItemsRoute(itemIds)}`, {
    ...DEFAULT_POST,
    headers: {},
  }).then(failOnError);
  return res.ok;
};

export const downloadItemThumbnail = async (
  { id, size = DEFAULT_THUMBNAIL_SIZES }: { id: UUID; size?: string },
  { API_HOST }: QueryClientConfig,
) => {
  let res = await fetch(
    `${API_HOST}/${buildDownloadItemThumbnailRoute({ id, size })}`,
    {
      ...DEFAULT_GET,
      headers: {},
    },
  );

  // try to fetch public items if cannot access privately
  if (FALLBACK_TO_PUBLIC_FOR_STATUS_CODES.includes(res.status)) {
    res = await fetch(
      `${API_HOST}/${buildDownloadPublicItemThumbnailRoute({ id, size })}`,
      DEFAULT_GET,
    ).then(failOnError);
  }

  if (!res.ok) {
    throw new Error(res.statusText);
  }

  return res;
};

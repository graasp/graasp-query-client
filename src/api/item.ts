import { StatusCodes } from 'http-status-codes';
import {
  buildCopyItemRoute,
  buildCopyItemsRoute,
  buildDeleteItemRoute,
  buildDeleteItemsRoute,
  buildDownloadFilesRoute,
  buildEditItemRoute,
  buildGetChildrenRoute,
  buildGetItemRoute,
  buildGetItemsRoute,
  buildGetPublicChildrenRoute,
  buildGetPublicItemRoute,
  buildGetS3MetadataRoute,
  buildMoveItemRoute,
  buildMoveItemsRoute,
  buildPostItemRoute,
  buildS3FileUrl,
  buildS3UploadFileRoute,
  GET_OWN_ITEMS_ROUTE,
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

export const getItem = async (id: UUID, { API_HOST }: QueryClientConfig) => {
  let res = await fetch(`${API_HOST}/${buildGetItemRoute(id)}`, DEFAULT_GET);

  // try to fetch public items if cannot access privately
  if (res.status === StatusCodes.UNAUTHORIZED) {
    res = await fetch(
      `${API_HOST}/${buildGetPublicItemRoute(id)}`,
      DEFAULT_GET,
    ).then(failOnError);
  }
  if (!res.ok) {
    throw new Error(res.statusText);
  }
  const item = await res.json();
  return item;
};

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
      name: item.name?.trim()
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
  if (res.status === StatusCodes.UNAUTHORIZED) {
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
    return Promise.all(parentIds.map((id) => getItem(id, config)));
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
) => {
  const response = await fetch(
    `${API_HOST}/${buildDownloadFilesRoute(id)}`,
    DEFAULT_GET,
  ).then(failOnError);
  return response;
};

export const uploadItemToS3 = async (
  {
    itemId,
    filename,
    contentType,
  }: { itemId: UUID; filename: string; contentType: string },
  { API_HOST }: QueryClientConfig,
) => {
  const response = await fetch(
    `${API_HOST}/${buildS3UploadFileRoute(itemId)}`,
    {
      // Send and receive JSON.
      ...DEFAULT_POST,
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        filename,
        contentType,
      }),
    },
  ).then(failOnError);

  return response.json();
};

export const getS3FileUrl = async (
  { id }: { id: UUID },
  { API_HOST, S3_FILES_HOST }: QueryClientConfig,
) => {
  const response = await fetch(
    `${API_HOST}/${buildGetS3MetadataRoute(id)}`,
    DEFAULT_GET,
  ).then(failOnError);

  const { key } = await response.json();
  return buildS3FileUrl(S3_FILES_HOST, key);
};

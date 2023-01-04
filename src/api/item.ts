import { Item } from '@graasp/sdk';

import { DEFAULT_THUMBNAIL_SIZES } from '../config/constants';
import { QueryClientConfig, UUID } from '../types';
import { getParentsIdsFromPath } from '../utils/item';
import configureAxios, {
  fallbackToPublic,
  verifyAuthentication,
} from './axios';
import {
  GET_OWN_ITEMS_ROUTE,
  GET_RECYCLED_ITEMS_ROUTE,
  SHARED_ITEM_WITH_ROUTE,
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
  buildPostEtherpadRoute,
  buildPostItemRoute,
  buildPublicDownloadFilesRoute,
  buildRecycleItemRoute,
  buildRecycleItemsRoute,
  buildRestoreItemsRoute,
} from './routes';

const axios = configureAxios();

export const getItem = (id: UUID, { API_HOST }: QueryClientConfig) =>
  fallbackToPublic(
    () => axios.get(`${API_HOST}/${buildGetItemRoute(id)}`),
    () => axios.get(`${API_HOST}/${buildGetPublicItemRoute(id)}`),
  );

export const getItems = async (ids: UUID[], { API_HOST }: QueryClientConfig) =>
  verifyAuthentication(() =>
    axios
      .get(`${API_HOST}/${buildGetItemsRoute(ids)}`)
      .then(({ data }) => data),
  );

export const getOwnItems = async ({ API_HOST }: QueryClientConfig) =>
  verifyAuthentication(() =>
    axios.get(`${API_HOST}/${GET_OWN_ITEMS_ROUTE}`).then(({ data }) => data),
  );

// payload = {name, type, description, extra}
// querystring = {parentId}
export const postItem = async (
  {
    name,
    type,
    description,
    extra,
    parentId,
  }: Item & {
    parentId: UUID;
  },
  { API_HOST }: QueryClientConfig,
) =>
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

export const deleteItem = async (id: UUID, { API_HOST }: QueryClientConfig) =>
  verifyAuthentication(() =>
    axios
      .delete(`${API_HOST}/${buildDeleteItemRoute(id)}`)
      .then(({ data }) => data),
  );

export const deleteItems = async (
  ids: UUID[],
  { API_HOST }: QueryClientConfig,
) =>
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
  { API_HOST }: QueryClientConfig,
) =>
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
  { API_HOST }: QueryClientConfig,
) =>
  fallbackToPublic(
    () => axios.get(`${API_HOST}/${buildGetChildrenRoute(id, ordered)}`),
    () => axios.get(`${API_HOST}/${buildGetPublicChildrenRoute(id, ordered)}`),
  );

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
) =>
  verifyAuthentication(() => {
    // send parentId if defined
    const body = { ...(to && { parentId: to }) };
    return axios
      .post(`${API_HOST}/${buildMoveItemRoute(id)}`, {
        ...body,
      })
      .then(({ data }) => data);
  });

export const moveItems = async (
  {
    to,
    id,
    ids,
  }: {
    /**
     * @deprecated use ids instead
     */
    id?: UUID[];
    ids: UUID[];
    to: UUID;
  },
  { API_HOST }: QueryClientConfig,
) =>
  verifyAuthentication(() => {
    // send parentId if defined
    const body = { ...(to && { parentId: to }) };
    return axios
      .post(`${API_HOST}/${buildMoveItemsRoute(id ?? ids)}`, {
        ...body,
      })
      .then(({ data }) => data);
  });

export const copyItem = async (
  { id, to }: { id: UUID; to: UUID },
  { API_HOST }: QueryClientConfig,
) =>
  verifyAuthentication(() => {
    // send parentId if defined
    const body = { ...(to && { parentId: to }) };
    return axios
      .post(`${API_HOST}/${buildCopyItemRoute(id)}`, {
        ...body,
      })
      .then(({ data }) => data);
  });

export const copyPublicItem = async (
  { id, to }: { id: UUID; to: UUID },
  { API_HOST }: QueryClientConfig,
) => {
  // send parentId if defined
  const body = { ...(to && { parentId: to }) };
  return axios
    .post(`${API_HOST}/${buildCopyPublicItemRoute(id)}`, {
      ...body,
    })
    .then(({ data }) => data);
};

export const copyItems = async (
  {
    id,
    ids,
    to,
  }: {
    /**
     * @deprecated use ids instead
     */
    id?: UUID[];
    ids: UUID[];
    to: UUID;
  },
  { API_HOST }: QueryClientConfig,
) =>
  verifyAuthentication(() => {
    // send parentId if defined
    const body = { ...(to && { parentId: to }) };
    return axios
      .post(`${API_HOST}/${buildCopyItemsRoute(id ?? ids)}`, {
        ...body,
      })
      .then(({ data }) => data);
  });

export const getSharedItems = async ({ API_HOST }: QueryClientConfig) =>
  verifyAuthentication(() =>
    axios
      .get<Item[]>(`${API_HOST}/${SHARED_ITEM_WITH_ROUTE}`, {})
      .then(({ data }) => data),
  );

export const getFileContent = async (
  { id }: { id: UUID },
  { API_HOST }: QueryClientConfig,
) =>
  fallbackToPublic(
    () =>
      axios.get(`${API_HOST}/${buildDownloadFilesRoute(id)}`, {
        responseType: 'blob',
      }),
    () =>
      axios.get(`${API_HOST}/${buildPublicDownloadFilesRoute(id)}`, {
        responseType: 'blob',
      }),
  );

export const getFileContentWithUrl = async (
  { id, replyUrl }: { id: UUID; replyUrl: boolean },
  { API_HOST }: QueryClientConfig,
) =>
  fallbackToPublic(
    () =>
      axios.get(`${API_HOST}/${buildDownloadFilesRoute(id)}`, {
        params: {
          replyUrl,
        },
      }),
    () =>
      axios.get(`${API_HOST}/${buildPublicDownloadFilesRoute(id)}`, {
        params: {
          replyUrl,
        },
      }),
  );

export const getRecycledItems = async ({ API_HOST }: QueryClientConfig) =>
  verifyAuthentication(() =>
    axios
      .get<Item[]>(`${API_HOST}/${GET_RECYCLED_ITEMS_ROUTE}`)
      .then(({ data }) => data),
  );

export const recycleItem = async (id: UUID, { API_HOST }: QueryClientConfig) =>
  verifyAuthentication(() =>
    axios
      .post(`${API_HOST}/${buildRecycleItemRoute(id)}`)
      .then(({ data }) => data),
  );

export const recycleItems = async (
  ids: UUID[],
  { API_HOST }: QueryClientConfig,
) =>
  verifyAuthentication(() =>
    axios
      .post(`${API_HOST}/${buildRecycleItemsRoute(ids)}`)
      .then(({ data }) => data),
  );

export const getPublicItemsWithTag = async (
  options: { tagId: UUID },
  { API_HOST }: QueryClientConfig,
) =>
  axios
    .get(`${API_HOST}/${buildGetPublicItemsWithTag(options)}`)
    .then(({ data }) => data);

export const restoreItems = async (
  itemIds: UUID[],
  { API_HOST }: QueryClientConfig,
) =>
  verifyAuthentication(() =>
    axios
      .post(`${API_HOST}/${buildRestoreItemsRoute(itemIds)}`)
      .then(({ data }) => data),
  );

export const downloadItemThumbnail = async (
  { id, size = DEFAULT_THUMBNAIL_SIZES }: { id: UUID; size?: string },
  { API_HOST }: QueryClientConfig,
) =>
  fallbackToPublic(
    () =>
      axios.get(
        `${API_HOST}/${buildDownloadItemThumbnailRoute({ id, size })}`,
        { responseType: 'blob' },
      ),
    () =>
      axios.get(
        `${API_HOST}/${buildDownloadPublicItemThumbnailRoute({ id, size })}`,
        { responseType: 'blob' },
      ),
  );

export const postEtherpad = async (
  {
    name,
    parentId,
  }: Pick<Item, 'name'> & {
    parentId: UUID;
  },
  { API_HOST }: QueryClientConfig,
) =>
  verifyAuthentication(() =>
    axios
      .post(`${API_HOST}/${buildPostEtherpadRoute(parentId)}`, {
        name: name.trim(),
      })
      .then(({ data }) => data),
  );

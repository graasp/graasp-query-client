import {
  AnyOfExcept,
  DiscriminatedItem,
  RecycledItemData,
  ResultOf,
  ShortLinkPayload,
  ShortLinkResponse,
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
  buildDeleteShortLinkRoute,
  buildDownloadFilesRoute,
  buildDownloadItemThumbnailRoute,
  buildEditItemRoute,
  buildGetChildrenRoute,
  buildGetItemDescendants,
  buildGetItemParents,
  buildGetItemRoute,
  buildGetItemsRoute,
  buildGetShortLinkRoute,
  buildGetShortLinksItemRoute,
  buildMoveItemsRoute,
  buildPatchShortLinkRoute,
  buildPostItemRoute,
  buildPostShortLinkRoute,
  buildRecycleItemsRoute,
  buildRestoreItemsRoute,
} from './routes';

export const getItem = (
  id: UUID,
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  axios
    .get<DiscriminatedItem>(`${API_HOST}/${buildGetItemRoute(id)}`)
    .then(({ data }) => data);

export const getItems = async (
  ids: UUID[],
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  axios
    .get<ResultOf<DiscriminatedItem>>(`${API_HOST}/${buildGetItemsRoute(ids)}`)
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
  Pick<DiscriminatedItem, 'type' | 'name'> & {
    parentId?: UUID;
  };
// payload = {name, type, description, extra}
// querystring = {parentId}
export const postItem = async (
  { name, type, description, extra, parentId }: PostItemPayloadType,
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  verifyAuthentication(() =>
    axios
      .post<DiscriminatedItem>(`${API_HOST}/${buildPostItemRoute(parentId)}`, {
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
      Pick<DiscriminatedItem, 'name' | 'description' | 'extra' | 'settings'>
    >,
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  verifyAuthentication(() =>
    axios
      .patch<DiscriminatedItem>(`${API_HOST}/${buildEditItemRoute(id)}`, {
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
    .get<DiscriminatedItem[]>(
      `${API_HOST}/${buildGetChildrenRoute(id, ordered)}`,
    )
    .then(({ data }) => data);

export const getParents = async (
  { id, path }: { id: UUID; path?: string },
  { API_HOST, axios }: PartialQueryConfigForApi,
) => {
  // shortcut to prevent fetching parents if path shows that item is a root
  if (path) {
    const parentIds = getParentsIdsFromPath(path, { ignoreSelf: true });
    if (!parentIds.length) {
      return [];
    }
  }
  return axios
    .get<DiscriminatedItem[]>(`${API_HOST}/${buildGetItemParents(id)}`)
    .then(({ data }) => data);
};

export const getDescendants = async (
  { id }: { id: UUID },
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  axios
    .get<DiscriminatedItem[]>(`${API_HOST}/${buildGetItemDescendants(id)}`)
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
      .get<RecycledItemData[]>(`${API_HOST}/${GET_RECYCLED_ITEMS_DATA_ROUTE}`)
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

export const getShortLink = (
  alias: string,
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  verifyAuthentication(() =>
    axios
      .get<string>(`${API_HOST}/${buildGetShortLinkRoute(alias)}`)
      .then(({ data }) => data),
  );

export const getShortLinksItem = (
  itemId: string,
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  verifyAuthentication(() =>
    axios
      .get<ShortLinkResponse[]>(
        `${API_HOST}/${buildGetShortLinksItemRoute(itemId)}`,
      )
      .then(({ data }) => data),
  );

export const deleteShortLink = (
  alias: string,
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  verifyAuthentication(() =>
    axios
      .delete<ShortLinkResponse>(
        `${API_HOST}/${buildDeleteShortLinkRoute(alias)}`,
      )
      .then(({ data }) => data),
  );

export const postShortLink = async (
  shortLink: ShortLinkPayload,
  { API_HOST, axios }: PartialQueryConfigForApi,
): Promise<ShortLinkPayload> =>
  verifyAuthentication(() =>
    axios
      .post<ShortLinkResponse>(`${API_HOST}/${buildPostShortLinkRoute()}`, {
        ...shortLink,
      })
      .then(({ data }) => data),
  );

export const patchShortLink = (
  alias: string,
  updatedPayload: AnyOfExcept<ShortLinkPayload, 'item'>,
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  verifyAuthentication(() =>
    axios
      .patch<ShortLinkResponse>(
        `${API_HOST}/${buildPatchShortLinkRoute(alias)}`,
        {
          ...updatedPayload,
        },
      )
      .then(({ data }) => data),
  );

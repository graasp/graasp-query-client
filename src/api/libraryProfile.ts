import { UUID } from '@graasp/sdk';

import { PartialQueryConfigForApi } from '../types';
import {
  GET_OWN_LIBRARY_PROFILE,
  LIBRARY_PROFILE_ROUTE,
  buildGetMemberProfileRoute,
} from './routes';

export const getOwnProfile = ({ API_HOST, axios }: PartialQueryConfigForApi) =>
  axios.get(`${API_HOST}/${GET_OWN_LIBRARY_PROFILE}`).then(({ data }) => data);

export const getMemberProfile = (
  memberId: UUID,
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  axios
    .get(`${API_HOST}/${buildGetMemberProfileRoute(memberId)}`)
    .then(({ data }) => data);

export type PostProfilePayloadType = {
  bio: string;
  twitterLink?: string;
  facebookLink?: string;
  linkedinLink?: string;
  visibility?: boolean;
};

export const postProfile = async (
  {
    bio,
    twitterLink,
    facebookLink,
    linkedinLink,
    visibility = false,
  }: PostProfilePayloadType,
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  axios
    .post(`${API_HOST}/${LIBRARY_PROFILE_ROUTE}`, {
      bio,
      twitterLink,
      facebookLink,
      linkedinLink,
      visibility,
    })
    .then(({ data }) => data);

// export const deleteItems = async (
//   ids: UUID[],
//   { API_HOST, axios }: PartialQueryConfigForApi,
// ) =>
//   verifyAuthentication(() =>
//     axios
//       .delete<void>(`${API_HOST}/${buildDeleteItemsRoute(ids)}`)
//       .then(({ data }) => data),
//   );

// // payload = {name, type, description, extra}
// // querystring = {parentId}
// export const editItem = async (
//   id: UUID,
//   item: Pick<DiscriminatedItem, 'id'> &
//     Partial<
//       Pick<DiscriminatedItem, 'name' | 'description' | 'extra' | 'settings'>
//     >,
//   { API_HOST, axios }: PartialQueryConfigForApi,
// ) =>
//   verifyAuthentication(() =>
//     axios
//       .patch<DiscriminatedItem>(`${API_HOST}/${buildEditItemRoute(id)}`, {
//         ...item,
//         name: item.name?.trim(),
//       })
//       .then(({ data }) => data),
//   );

// export const getChildren = async (
//   id: UUID,
//   // eslint-disable-next-line default-param-last
//   ordered = true,
//   { API_HOST, axios }: PartialQueryConfigForApi,
// ) =>
//   axios
//     .get<DiscriminatedItem[]>(
//       `${API_HOST}/${buildGetChildrenRoute(id, ordered)}`,
//     )
//     .then(({ data }) => data);

// export const getParents = async (
//   { id, path }: { id: UUID; path?: string },
//   { API_HOST, axios }: PartialQueryConfigForApi,
// ) => {
//   // shortcut to prevent fetching parents if path shows that item is a root
//   if (path) {
//     const parentIds = getParentsIdsFromPath(path, { ignoreSelf: true });
//     if (!parentIds.length) {
//       return [];
//     }
//   }
//   return axios
//     .get<DiscriminatedItem[]>(`${API_HOST}/${buildGetItemParents(id)}`)
//     .then(({ data }) => data);
// };

// export const getDescendants = async (
//   { id }: { id: UUID },
//   { API_HOST, axios }: PartialQueryConfigForApi,
// ) =>
//   axios
//     .get<DiscriminatedItem[]>(`${API_HOST}/${buildGetItemDescendants(id)}`)
//     .then(({ data }) => data);

// export const moveItems = async (
//   {
//     to,
//     ids,
//   }: {
//     ids: UUID[];
//     to?: UUID;
//   },
//   { API_HOST, axios }: PartialQueryConfigForApi,
// ) =>
//   verifyAuthentication(() => {
//     // send parentId if defined
//     const body = { ...(to && { parentId: to }) };
//     return axios
//       .post<void>(`${API_HOST}/${buildMoveItemsRoute(ids)}`, {
//         ...body,
//       })
//       .then(({ data }) => data);
//   });

// export const copyItems = async (
//   {
//     ids,
//     to,
//   }: {
//     ids: UUID[];
//     to?: UUID;
//   },
//   { API_HOST, axios }: PartialQueryConfigForApi,
// ) =>
//   verifyAuthentication(() => {
//     // send parentId if defined
//     const body = { ...(to && { parentId: to }) };
//     return axios
//       .post<void>(`${API_HOST}/${buildCopyItemsRoute(ids)}`, {
//         ...body,
//       })
//       .then(({ data }) => data);
//   });

// export const getSharedItems = async ({
//   API_HOST,
//   axios,
// }: PartialQueryConfigForApi) =>
//   verifyAuthentication(() =>
//     axios
//       .get<DiscriminatedItem[]>(`${API_HOST}/${SHARED_ITEM_WITH_ROUTE}`, {})
//       .then(({ data }) => data),
//   );

// export const getFileContent = async (
//   id: UUID,
//   { API_HOST, axios }: PartialQueryConfigForApi,
// ) =>
//   axios
//     .get<Blob>(`${API_HOST}/${buildDownloadFilesRoute(id)}`, {
//       responseType: 'blob',
//     })
//     .then(({ data }) => data);

// export const getFileContentUrl = async (
//   id: UUID,
//   { API_HOST, axios }: PartialQueryConfigForApi,
// ) =>
//   axios
//     .get<string>(`${API_HOST}/${buildDownloadFilesRoute(id)}`, {
//       params: {
//         replyUrl: true,
//       },
//     })
//     .then(({ data }) => data);

// export const getRecycledItemsData = async ({
//   API_HOST,
//   axios,
// }: PartialQueryConfigForApi) =>
//   verifyAuthentication(() =>
//     axios
//       .get<RecycledItemData[]>(`${API_HOST}/${GET_RECYCLED_ITEMS_DATA_ROUTE}`)
//       .then(({ data }) => data),
//   );

// export const recycleItems = async (
//   ids: UUID[],
//   { API_HOST, axios }: PartialQueryConfigForApi,
// ) =>
//   verifyAuthentication(() =>
//     axios
//       .post<void>(`${API_HOST}/${buildRecycleItemsRoute(ids)}`)
//       .then(({ data }) => data),
//   );

// export const restoreItems = async (
//   itemIds: UUID[],
//   { API_HOST, axios }: PartialQueryConfigForApi,
// ) =>
//   verifyAuthentication(() =>
//     axios
//       .post<void>(`${API_HOST}/${buildRestoreItemsRoute(itemIds)}`)
//       .then(({ data }) => data),
//   );

// export const downloadItemThumbnail = async (
//   { id, size = DEFAULT_THUMBNAIL_SIZE }: { id: UUID; size?: string },
//   { API_HOST, axios }: PartialQueryConfigForApi,
// ) =>
//   axios
//     .get<Blob>(
//       `${API_HOST}/${buildDownloadItemThumbnailRoute({
//         id,
//         size,
//         replyUrl: false,
//       })}`,
//       {
//         responseType: 'blob',
//       },
//     )
//     .then(({ data }) => data);

// export const downloadItemThumbnailUrl = async (
//   { id, size = DEFAULT_THUMBNAIL_SIZE }: { id: UUID; size?: string },
//   { API_HOST, axios }: PartialQueryConfigForApi,
// ) =>
//   axios
//     .get<string>(
//       `${API_HOST}/${buildDownloadItemThumbnailRoute({
//         id,
//         size,
//         replyUrl: true,
//       })}`,
//     )
//     .then(({ data }) => data);

import qs from 'qs';
import { UUID } from '../types';

export const ITEMS_ROUTE = 'items';
export const GET_OWN_ITEMS_ROUTE = `${ITEMS_ROUTE}/own`;
export const SHARE_ITEM_WITH_ROUTE = `${ITEMS_ROUTE}/shared-with`;
export const buildPostItemRoute = (parentId: UUID) => {
  let url = ITEMS_ROUTE;
  if (parentId) {
    url += `?parentId=${parentId}`;
  }
  return url;
};
export const buildDeleteItemRoute = (id: UUID) => `${ITEMS_ROUTE}/${id}`;
export const buildDeleteItemsRoute = (ids: UUID[]) =>
  `${ITEMS_ROUTE}?${ids.map((id) => `id=${id}`).join('&')}`;
export const buildGetChildrenRoute = (id: UUID) =>
  `${ITEMS_ROUTE}/${id}/children`;
export const buildGetItemRoute = (id: UUID) => `${ITEMS_ROUTE}/${id}`;
export const buildMoveItemRoute = (id: UUID) => `${ITEMS_ROUTE}/${id}/move`;
export const buildCopyItemRoute = (id: UUID) => `${ITEMS_ROUTE}/${id}/copy`;
export const buildEditItemRoute = (id: UUID) => `${ITEMS_ROUTE}/${id}`;
export const buildShareItemWithRoute = (id: UUID) =>
  `item-memberships?itemId=${id}`;
export const buildGetItemMembershipForItemRoute = (id: UUID) =>
  `item-memberships?itemId=${id}`;

export const MEMBERS_ROUTE = `members`;
export const buildGetMemberBy = (email: string) =>
  `${MEMBERS_ROUTE}?email=${email}`;
export const buildGetMember = (id: UUID) => `${MEMBERS_ROUTE}/${id}`;
export const buildPatchMember = (id: UUID) => `${MEMBERS_ROUTE}/${id}`;
export const buildUploadFilesRoute = (parentId: UUID) =>
  parentId
    ? `${ITEMS_ROUTE}/upload?parentId=${parentId}`
    : `${ITEMS_ROUTE}/upload`;
export const buildDownloadFilesRoute = (id: UUID) =>
  `${ITEMS_ROUTE}/${id}/download`;
export const buildS3UploadFileRoute = (parentId: UUID) =>
  parentId
    ? `${ITEMS_ROUTE}/s3-upload?parentId=${parentId}`
    : `${ITEMS_ROUTE}/s3-upload`;
export const buildGetS3MetadataRoute = (id: UUID) =>
  `${ITEMS_ROUTE}/${id}/s3-metadata`;
export const buildS3FileUrl = (S3_FILES_HOST: string, key: string) =>
  `${S3_FILES_HOST}/${key}`;
export const GET_CURRENT_MEMBER_ROUTE = `${MEMBERS_ROUTE}/current`;
export const buildSignInPath = (to: string) => {
  const queryString = qs.stringify({ to }, { addQueryPrefix: true });
  return `signin${queryString}`;
};
export const SIGN_OUT_ROUTE = 'logout';
export const buildGetItemTagsRoute = (id: UUID) => `${ITEMS_ROUTE}/${id}/tags`;
export const buildPostItemTagRoute = (id: UUID) => `${ITEMS_ROUTE}/${id}/tags`;
export const buildPutItemLoginSchema = (id: UUID) =>
  `${ITEMS_ROUTE}/${id}/login-schema`;
export const buildDeleteItemTagRoute = ({
  id,
  tagId,
}: {
  id: UUID;
  tagId: UUID;
}) => `${ITEMS_ROUTE}/${id}/tags/${tagId}`;
export const buildPostItemLoginSignInRoute = (id: UUID) =>
  `${ITEMS_ROUTE}/${id}/login`;
export const GET_TAGS_ROUTE = `${ITEMS_ROUTE}/tags`;
export const buildGetItemLoginRoute = (id: UUID) =>
  `${ITEMS_ROUTE}/${id}/login-schema`;

export const API_ROUTES = {
  ITEMS_ROUTE,
  SHARE_ITEM_WITH_ROUTE,
  GET_OWN_ITEMS_ROUTE,
  SIGN_OUT_ROUTE,
  GET_CURRENT_MEMBER_ROUTE,
  GET_TAGS_ROUTE,
  buildGetS3MetadataRoute,
  buildGetMember,
  buildUploadFilesRoute,
  buildDownloadFilesRoute,
  buildS3FileUrl,
  buildS3UploadFileRoute,
  buildShareItemWithRoute,
  buildSignInPath,
  buildPostItemLoginSignInRoute,
  buildGetItemMembershipForItemRoute,
  buildMoveItemRoute,
  buildPostItemRoute,
  buildPostItemTagRoute,
  buildPutItemLoginSchema,
  buildEditItemRoute,
  buildGetChildrenRoute,
  buildGetItemLoginRoute,
  buildGetItemRoute,
  buildGetItemTagsRoute,
  buildGetMemberBy,
  buildDeleteItemTagRoute,
  buildDeleteItemRoute,
  buildDeleteItemsRoute,
  buildCopyItemRoute,
};

import qs from 'qs';
import { DEFAULT_THUMBNAIL_SIZES } from '../config/constants';
import { UUID } from '../types';

export const APPS_ROUTE = 'app-items';
export const ITEMS_ROUTE = 'items';
export const ITEM_MEMBERSHIPS_ROUTE = 'item-memberships';
export const MEMBERS_ROUTE = `members`;
export const GET_OWN_ITEMS_ROUTE = `${ITEMS_ROUTE}/own`;
export const GET_RECYCLED_ITEMS_ROUTE = `${ITEMS_ROUTE}/recycled`;
export const SHARE_ITEM_WITH_ROUTE = `${ITEMS_ROUTE}/shared-with`;
export const CATEGORIES_ROUTE = `${ITEMS_ROUTE}/categories`;

export const buildAppListRoute = `${APPS_ROUTE}/list`;

export const buildPostItemRoute = (parentId?: UUID) => {
  let url = ITEMS_ROUTE;
  if (parentId) {
    url += `?parentId=${parentId}`;
  }
  return url;
};
export const buildDeleteItemRoute = (id: UUID) => `${ITEMS_ROUTE}/${id}/delete`;
export const buildDeleteItemsRoute = (ids: UUID[]) =>
  `${ITEMS_ROUTE}/delete?${qs.stringify(
    { id: ids },
    { arrayFormat: 'repeat' },
  )}`;
export const buildGetChildrenRoute = (id: UUID, ordered: boolean) =>
  `${ITEMS_ROUTE}/${id}/children${qs.stringify(
    { ordered },
    { addQueryPrefix: true },
  )}`;
export const buildGetItemRoute = (
  id: UUID,
  options?: { withMemberships?: boolean },
) => `${ITEMS_ROUTE}/${id}${qs.stringify(options, { addQueryPrefix: true })}`;
export const buildGetPublicItemRoute = (
  id: UUID,
  options?: { withMemberships?: boolean },
) => `p/${ITEMS_ROUTE}/${id}${qs.stringify(options, { addQueryPrefix: true })}`;
export const buildGetPublicChildrenRoute = (id: UUID, ordered: boolean) =>
  `p/${ITEMS_ROUTE}/${id}/children${qs.stringify(
    { ordered },
    { addQueryPrefix: true },
  )}`;
export const buildGetItemsRoute = (ids: UUID[]) =>
  `${ITEMS_ROUTE}?${qs.stringify({ id: ids }, { arrayFormat: 'repeat' })}`;
export const buildMoveItemRoute = (id: UUID) => `${ITEMS_ROUTE}/${id}/move`;
export const buildMoveItemsRoute = (ids: UUID[]) =>
  `${ITEMS_ROUTE}/move?${qs.stringify({ id: ids }, { arrayFormat: 'repeat' })}`;
export const buildCopyItemRoute = (id: UUID) => `${ITEMS_ROUTE}/${id}/copy`;
export const buildCopyPublicItemRoute = (id: UUID) =>
  `p/${ITEMS_ROUTE}/${id}/copy`;
export const buildCopyItemsRoute = (ids: UUID[]) =>
  `${ITEMS_ROUTE}/copy?${qs.stringify({ id: ids }, { arrayFormat: 'repeat' })}`;
export const buildEditItemRoute = (id: UUID) => `${ITEMS_ROUTE}/${id}`;
export const buildShareItemWithRoute = (id: UUID) =>
  `item-memberships?itemId=${id}`;
export const buildGetItemMembershipsForItemsRoute = (ids: UUID[]) =>
  `item-memberships${qs.stringify(
    { itemId: ids },
    { addQueryPrefix: true, arrayFormat: 'repeat' },
  )}`;
export const buildGetItemChatRoute = (id: UUID) => `${ITEMS_ROUTE}/${id}/chat`;
export const buildPostItemChatMessageRoute = (id: UUID) =>
  `${ITEMS_ROUTE}/${id}/chat`;

export const buildGetMemberBy = (email: string) =>
  `${MEMBERS_ROUTE}/search?email=${email.toLowerCase()}`;
export const buildGetMember = (id: UUID) => `${MEMBERS_ROUTE}/${id}`;
export const buildGetMembersRoute = (ids: UUID[]) =>
  `${MEMBERS_ROUTE}?${qs.stringify({ id: ids }, { arrayFormat: 'repeat' })}`;
export const buildPatchMember = (id: UUID) => `${MEMBERS_ROUTE}/${id}`;
export const buildUploadFilesRoute = (parentId: UUID) => `${ITEMS_ROUTE}/upload${qs.stringify(
  { id: parentId },
  { addQueryPrefix: true },
)}`;
export const buildDownloadFilesRoute = (id: UUID) =>
  `${ITEMS_ROUTE}/${id}/download`;
export const buildUploadAvatarRoute = (id: UUID) =>
  `${MEMBERS_ROUTE}/avatars/upload${qs.stringify(
    { id },
    { addQueryPrefix: true },
  )}`;
export const buildDownloadAvatarRoute = ({
  id,
  size = DEFAULT_THUMBNAIL_SIZES,
}: {
  id: UUID;
  size?: string;
}) =>
  `${MEMBERS_ROUTE}/avatars/${id}/download${qs.stringify(
    { size },
    { addQueryPrefix: true },
  )}`;
export const buildDownloadPublicAvatarRoute = ({
  id,
  size = DEFAULT_THUMBNAIL_SIZES,
}: {
  id: UUID;
  size?: string;
}) => `p/${buildDownloadAvatarRoute({ id, size })}`;
export const buildUploadItemThumbnailRoute = (id: UUID) =>
  `${ITEMS_ROUTE}/thumbnails/upload${qs.stringify({ id }, { addQueryPrefix: true })}`;
export const buildDownloadItemThumbnailRoute = ({
  id,
  size = DEFAULT_THUMBNAIL_SIZES,
}: {
  id: UUID;
  size?: string;
}) =>
  `${ITEMS_ROUTE}/thumbnails/${id}/download${qs.stringify(
    { size },
    { addQueryPrefix: true },
  )}`;
export const buildDownloadPublicItemThumbnailRoute = ({
  id,
  size = DEFAULT_THUMBNAIL_SIZES,
}: {
  id: UUID;
  size?: string;
}) => `p/${buildDownloadItemThumbnailRoute({ id, size })}`;
export const buildPublicDownloadFilesRoute = (id: UUID) =>
  `p/${buildDownloadFilesRoute(id)}`;
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
export const buildEditItemMembershipRoute = (id: UUID) =>
  `${ITEM_MEMBERSHIPS_ROUTE}/${id}`;
export const buildDeleteItemMembershipRoute = (id: UUID) =>
  `${ITEM_MEMBERSHIPS_ROUTE}/${id}`;

export const GET_FLAGS_ROUTE = `${ITEMS_ROUTE}/flags`;
export const buildPostItemFlagRoute = (id: UUID) =>
  `${ITEMS_ROUTE}/${id}/flags`;
export const buildRecycleItemRoute = (id: UUID) =>
  `${ITEMS_ROUTE}/${id}/recycle`;
export const buildRecycleItemsRoute = (ids: UUID[]) =>
  `${ITEMS_ROUTE}/recycle?${qs.stringify(
    { id: ids },
    { arrayFormat: 'repeat' },
  )}`;
export const buildGetPublicItemsWithTag = (options: {
  tagId: UUID;
  withMemberships?: boolean;
}) => `p/${ITEMS_ROUTE}?${qs.stringify(options)}`;
export const buildGetPublicMembersRoute = (ids: UUID[]) =>
  `p/${MEMBERS_ROUTE}?${qs.stringify({ id: ids }, { arrayFormat: 'repeat' })}`;

export const buildGetPublicMember = (id: UUID) => `p/${MEMBERS_ROUTE}/${id}`;
export const buildRestoreItemsRoute = (ids: UUID[]) =>
  `${ITEMS_ROUTE}/restore?${qs.stringify(
    { id: ids },
    { arrayFormat: 'repeat' },
  )}`;

export const GET_CATEGORY_TYPES_ROUTE = `${ITEMS_ROUTE}/category-types`;
export const buildGetCategoriesRoute = (ids?: UUID[]) =>
  `${CATEGORIES_ROUTE}?${qs.stringify(
    { type: ids },
    { arrayFormat: 'repeat' },
  )}`;
export const buildGetCategoryInfoRoute = (id: UUID) =>
  `${CATEGORIES_ROUTE}/${id}`;
export const buildGetItemCategoriesRoute = (id: UUID) =>
  `${ITEMS_ROUTE}/${id}/categories`;
export const buildGetItemsInCategoryRoute = (ids: UUID[]) =>
  `${ITEMS_ROUTE}/withCategories?${qs.stringify(
    { category: ids },
    { arrayFormat: 'repeat' },
  )}`;
export const buildPostItemCategoryRoute = (id: UUID) =>
  `${ITEMS_ROUTE}/${id}/categories`;
export const buildDeleteItemCategoryRoute = (id: UUID) =>
  `${ITEMS_ROUTE}/item-category/${id}`;

export const API_ROUTES = {
  APPS_ROUTE,
  ITEMS_ROUTE,
  SHARE_ITEM_WITH_ROUTE,
  GET_OWN_ITEMS_ROUTE,
  GET_RECYCLED_ITEMS_ROUTE,
  SIGN_OUT_ROUTE,
  GET_CURRENT_MEMBER_ROUTE,
  GET_TAGS_ROUTE,
  GET_FLAGS_ROUTE,
  GET_CATEGORY_TYPES_ROUTE,
  buildAppListRoute,
  buildGetMember,
  buildGetMembersRoute,
  buildUploadFilesRoute,
  buildDownloadFilesRoute,
  buildShareItemWithRoute,
  buildSignInPath,
  buildPostItemLoginSignInRoute,
  buildGetItemMembershipsForItemsRoute,
  buildMoveItemRoute,
  buildMoveItemsRoute,
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
  buildCopyPublicItemRoute,
  buildCopyItemsRoute,
  buildPatchMember,
  buildPostItemFlagRoute,
  buildEditItemMembershipRoute,
  buildDeleteItemMembershipRoute,
  buildGetPublicItemRoute,
  buildGetPublicChildrenRoute,
  buildGetItemChatRoute,
  buildPostItemChatMessageRoute,
  buildRecycleItemRoute,
  buildRecycleItemsRoute,
  buildGetPublicItemsWithTag,
  buildGetPublicMember,
  buildGetPublicMembersRoute,
  buildRestoreItemsRoute,
  buildGetCategoriesRoute,
  buildGetCategoryInfoRoute,
  buildGetItemCategoriesRoute,
  buildPostItemCategoryRoute,
  buildDeleteItemCategoryRoute,
  buildUploadItemThumbnailRoute,
  buildDownloadItemThumbnailRoute,
  buildDownloadPublicItemThumbnailRoute,
  buildUploadAvatarRoute,
  buildDownloadAvatarRoute,
  buildDownloadPublicAvatarRoute,
};

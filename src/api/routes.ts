import qs from 'qs';
import { DEFAULT_THUMBNAIL_SIZES } from '../config/constants';
import { UUID } from '../types';

export const APPS_ROUTE = 'app-items';
export const ITEMS_ROUTE = 'items';
export const ITEM_MEMBERSHIPS_ROUTE = 'item-memberships';
export const MEMBERS_ROUTE = `members`;
export const SUBSCRIPTION_ROUTE = 'subscriptions';
export const SUBSCRIPTION_KEY = 'subscriptions';
export const GET_OWN_ITEMS_ROUTE = `${ITEMS_ROUTE}/own`;
export const INVITATIONS_ROUTE = `invitations`;
export const GET_RECYCLED_ITEMS_ROUTE = `${ITEMS_ROUTE}/recycled`;
export const SHARED_ITEM_WITH_ROUTE = `${ITEMS_ROUTE}/shared-with`;
export const CATEGORIES_ROUTE = `${ITEMS_ROUTE}/categories`;
const PUBLIC_PREFIX = `p`;

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
  `${ITEMS_ROUTE}/delete${qs.stringify(
    { id: ids },
    {
      arrayFormat: 'repeat',
      addQueryPrefix: true,
    },
  )}`;
export const buildGetChildrenRoute = (id: UUID, ordered: boolean) =>
  `${ITEMS_ROUTE}/${id}/children${qs.stringify(
    { ordered },
    { addQueryPrefix: true },
  )}`;
export const buildGetItemRoute = (id: UUID) => `${ITEMS_ROUTE}/${id}`;
export const buildGetPublicItemRoute = (id: UUID) =>
  `${PUBLIC_PREFIX}/${ITEMS_ROUTE}/${id}`;
export const buildGetPublicChildrenRoute = (id: UUID, ordered: boolean) =>
  `${PUBLIC_PREFIX}/${buildGetChildrenRoute(id, ordered)}`;
export const buildGetItemsRoute = (ids: UUID[]) =>
  `${ITEMS_ROUTE}?${qs.stringify({ id: ids }, { arrayFormat: 'repeat' })}`;
export const buildMoveItemRoute = (id: UUID) => `${ITEMS_ROUTE}/${id}/move`;
export const buildMoveItemsRoute = (ids: UUID[]) =>
  `${ITEMS_ROUTE}/move?${qs.stringify({ id: ids }, { arrayFormat: 'repeat' })}`;
export const buildCopyItemRoute = (id: UUID) => `${ITEMS_ROUTE}/${id}/copy`;
export const buildCopyPublicItemRoute = (id: UUID) =>
  `${PUBLIC_PREFIX}/${ITEMS_ROUTE}/${id}/copy`;
export const buildCopyItemsRoute = (ids: UUID[]) =>
  `${ITEMS_ROUTE}/copy?${qs.stringify({ id: ids }, { arrayFormat: 'repeat' })}`;
export const buildEditItemRoute = (id: UUID) => `${ITEMS_ROUTE}/${id}`;
export const buildExportItemRoute = (id: UUID) =>
  `${ITEMS_ROUTE}/zip-export/${id}`;
export const buildExportPublicItemRoute = (id: UUID) =>
  `${PUBLIC_PREFIX}/${buildExportItemRoute(id)}`;
export const buildPostItemMembershipRoute = (id: UUID) =>
  `item-memberships?itemId=${id}`;
export const buildPostManyItemMembershipsRoute = (id: UUID) =>
  `item-memberships/${id}`;
export const buildInviteRoute = (id: UUID) => `invite/${id}`;
export const buildGetItemMembershipsForItemsRoute = (ids: UUID[]) =>
  `item-memberships${qs.stringify(
    { itemId: ids },
    {
      addQueryPrefix: true,
      arrayFormat: 'repeat',
    },
  )}`;
export const buildGetPublicItemMembershipsForItemsRoute = (ids: UUID[]) =>
  `${PUBLIC_PREFIX}/${buildGetItemMembershipsForItemsRoute(ids)}`;
export const buildGetItemInvitationsForItemRoute = (id: UUID) =>
  `${ITEMS_ROUTE}/${id}/invitations`;

export const buildGetItemChatRoute = (id: UUID) => `${ITEMS_ROUTE}/${id}/chat`;
export const buildGetPublicItemChatRoute = (id: UUID) =>
  `${PUBLIC_PREFIX}/${buildGetItemChatRoute(id)}`;
export const buildPostItemChatMessageRoute = (id: UUID) =>
  `${ITEMS_ROUTE}/${id}/chat`;
export const buildPatchItemChatMessageRoute = (chatId: UUID, messageId: UUID) =>
  `${ITEMS_ROUTE}/${chatId}/chat/${messageId}`;
export const buildDeleteItemChatMessageRoute = (
  chatId: UUID,
  messageId: UUID,
) => `${ITEMS_ROUTE}/${chatId}/chat/${messageId}`;
export const buildClearItemChatRoute = (id: UUID) =>
  `${ITEMS_ROUTE}/${id}/chat`;

export const buildGetMemberMentionsRoute = () => `${ITEMS_ROUTE}/mentions`;
export const buildPatchMentionRoute = (id: UUID) =>
  `${ITEMS_ROUTE}/mentions/${id}`;
export const buildDeleteMentionRoute = (id: UUID) =>
  `${ITEMS_ROUTE}/mentions/${id}`;
export const buildClearMentionsRoute = () => `${ITEMS_ROUTE}/mentions`;

export const buildGetMembersBy = (emails: string[]) =>
  `${MEMBERS_ROUTE}/search${qs.stringify(
    { email: emails.map((e) => e.toLowerCase()) },
    {
      arrayFormat: 'repeat',
      addQueryPrefix: true,
    },
  )}`;
export const buildGetMember = (id: UUID) => `${MEMBERS_ROUTE}/${id}`;
export const buildGetMembersRoute = (ids: UUID[]) =>
  `${MEMBERS_ROUTE}?${qs.stringify({ id: ids }, { arrayFormat: 'repeat' })}`;
export const buildPatchMember = (id: UUID) => `${MEMBERS_ROUTE}/${id}`;
export const buildDeleteMemberRoute = (id: UUID) => `${MEMBERS_ROUTE}/${id}`;
export const buildUpdateMemberPasswordRoute = () =>
  `${MEMBERS_ROUTE}/update-password`;
export const buildUploadFilesRoute = (parentId: UUID) =>
  `${ITEMS_ROUTE}/upload${qs.stringify(
    { id: parentId },
    { addQueryPrefix: true },
  )}`;
export const buildImportZipRoute = (parentId: UUID) =>
  `${ITEMS_ROUTE}/zip-import${qs.stringify(
    { parentId },
    { addQueryPrefix: true },
  )}`;
export const buildImportH5PRoute = (parentId: UUID) =>
  `${ITEMS_ROUTE}/h5p-import${qs.stringify(
    { parentId },
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
}) =>
  `p/${buildDownloadAvatarRoute({
    id,
    size,
  })}`;
export const buildUploadItemThumbnailRoute = (id: UUID) =>
  `${ITEMS_ROUTE}/thumbnails/upload${qs.stringify(
    { id },
    { addQueryPrefix: true },
  )}`;
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
}) =>
  `${PUBLIC_PREFIX}/${buildDownloadItemThumbnailRoute({
    id,
    size,
  })}`;
export const buildPublicDownloadFilesRoute = (id: UUID) =>
  `${PUBLIC_PREFIX}/${buildDownloadFilesRoute(id)}`;

export const GET_CURRENT_MEMBER_ROUTE = `${MEMBERS_ROUTE}/current`;
export const SIGN_IN_ROUTE = `login`;
export const SIGN_IN_WITH_PASSWORD_ROUTE = `login-password`;
export const SIGN_UP_ROUTE = `register`;
export const SIGN_OUT_ROUTE = 'logout';
export const buildGetItemTagsRoute = (id: UUID) => `${ITEMS_ROUTE}/${id}/tags`;
export const buildGetItemsTagsRoute = (ids: UUID[]) =>
  `${ITEMS_ROUTE}/tags?${qs.stringify({ id: ids }, { arrayFormat: 'repeat' })}`;
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
export const GET_TAGS_ROUTE = `${ITEMS_ROUTE}/tags/list`;
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
  `${ITEMS_ROUTE}/recycle${qs.stringify(
    { id: ids },
    {
      arrayFormat: 'repeat',
      addQueryPrefix: true,
    },
  )}`;
export const buildGetPublicItemsWithTag = (options: { tagId: UUID }) =>
  `${PUBLIC_PREFIX}/${ITEMS_ROUTE}?${qs.stringify(options)}`;
export const buildGetPublicMembersRoute = (ids: UUID[]) =>
  `${PUBLIC_PREFIX}/${MEMBERS_ROUTE}?${qs.stringify(
    { id: ids },
    { arrayFormat: 'repeat' },
  )}`;

export const buildGetPublicMember = (id: UUID) => `p/${MEMBERS_ROUTE}/${id}`;
export const buildRestoreItemsRoute = (ids: UUID[]) =>
  `${ITEMS_ROUTE}/restore${qs.stringify(
    { id: ids },
    {
      arrayFormat: 'repeat',
      addQueryPrefix: true,
    },
  )}`;

export const GET_CATEGORY_TYPES_ROUTE = `${PUBLIC_PREFIX}/${ITEMS_ROUTE}/category-types`;
export const buildGetCategoriesRoute = (ids?: UUID[]) =>
  `${PUBLIC_PREFIX}/${CATEGORIES_ROUTE}${qs.stringify(
    { typeId: ids },
    {
      arrayFormat: 'repeat',
      addQueryPrefix: true,
    },
  )}`;
export const buildGetCategoryRoute = (id: UUID) =>
  `${PUBLIC_PREFIX}/${CATEGORIES_ROUTE}/${id}`;
export const buildGetItemCategoriesRoute = (id: UUID) =>
  `${ITEMS_ROUTE}/${id}/categories`;
export const buildGetPublicItemCategoriesRoute = (id: UUID) =>
  `${PUBLIC_PREFIX}/${ITEMS_ROUTE}/${id}/categories`;
export const buildGetItemsInCategoryRoute = (ids: UUID[]) =>
  `${PUBLIC_PREFIX}/${ITEMS_ROUTE}/with-categories${qs.stringify(
    { categoryId: ids },
    {
      arrayFormat: 'repeat',
      addQueryPrefix: true,
    },
  )}`;
export const buildPostItemCategoryRoute = (id: UUID) =>
  `${ITEMS_ROUTE}/${id}/categories`;
export const buildDeleteItemCategoryRoute = (args: {
  itemId: UUID;
  itemCategoryId: UUID;
}) => `${ITEMS_ROUTE}/${args.itemId}/categories/${args.itemCategoryId}`;
export const buildGetApiAccessTokenRoute = (id: UUID) =>
  `${APPS_ROUTE}/${id}/api-access-token`;
export const buildGetPublicApiAccessTokenRoute = (id: UUID) =>
  `${PUBLIC_PREFIX}/${buildGetApiAccessTokenRoute(id)}`;

export const buildGetItemsByKeywordRoute = (range: string, keywords: string) =>
  `${PUBLIC_PREFIX}/${ITEMS_ROUTE}/search/${range}/${keywords}`;

export const buildGetLikedItemsRoute = (id: UUID) =>
  `${ITEMS_ROUTE}/${id}/likes`;
export const buildGetLikeCountRoute = (id: UUID) =>
  `${ITEMS_ROUTE}/${id}/like-count`;
export const buildPostItemLikeRoute = (id: UUID) => `${ITEMS_ROUTE}/${id}/like`;
export const buildDeleteItemLikeRoute = (id: UUID) =>
  `${ITEMS_ROUTE}/likes/${id}`;

export const VALIDATION_ROUTE = 'validations';
export const buildGetItemValidationAndReviewRoute = (id: UUID) =>
  `${ITEMS_ROUTE}/${VALIDATION_ROUTE}/status/${id}`;
export const buildGetItemValidationGroupsRoute = (id: UUID) =>
  `${ITEMS_ROUTE}/${VALIDATION_ROUTE}/groups/${id}`;
export const GET_ITEM_VALIDATION_REVIEWS_ROUTE = `${ITEMS_ROUTE}/${VALIDATION_ROUTE}/reviews`;
export const GET_ITEM_VALIDATION_STATUSES_ROUTE = `${ITEMS_ROUTE}/${VALIDATION_ROUTE}/statuses`;
export const GET_ITEM_VALIDATION_REVIEW_STATUSES_ROUTE = `${ITEMS_ROUTE}/${VALIDATION_ROUTE}/review/statuses`;
export const buildPostItemValidationRoute = (id: UUID) =>
  `${ITEMS_ROUTE}/${VALIDATION_ROUTE}/${id}`;
export const buildUpdateItemValidationReviewRoute = (id: UUID) =>
  `${ITEMS_ROUTE}/${VALIDATION_ROUTE}/${id}/review`;
export const buildGetActions = (
  itemId: UUID,
  options: { requestedSampleSize: number; view: string },
) =>
  `analytics/${ITEMS_ROUTE}/${itemId}${qs.stringify(
    {
      requestedSampleSize: options.requestedSampleSize,
      view: options.view,
    },
    {
      addQueryPrefix: true,
    },
  )}`;
export const buildExportActions = (itemId: UUID) =>
  `analytics/${ITEMS_ROUTE}/${itemId}/export`;
export const buildGetInvitationRoute = (id: UUID) =>
  `${ITEMS_ROUTE}/${INVITATIONS_ROUTE}/${id}`;
export const buildPatchInvitationRoute = (args: { itemId: UUID; id: UUID }) =>
  `${ITEMS_ROUTE}/${args.itemId}/${INVITATIONS_ROUTE}/${args.id}`;
export const buildDeleteInvitationRoute = (args: { itemId: UUID; id: UUID }) =>
  `${ITEMS_ROUTE}/${args.itemId}/${INVITATIONS_ROUTE}/${args.id}`;
export const buildPostInvitationsRoute = (itemId: UUID) =>
  `${ITEMS_ROUTE}/${itemId}/invite`;
export const buildResendInvitationRoute = (args: { itemId: UUID; id: UUID }) =>
  `${ITEMS_ROUTE}/${args.itemId}/${INVITATIONS_ROUTE}/${args.id}/send`;

export const GET_PLANS_ROUTE = `${MEMBERS_ROUTE}/${SUBSCRIPTION_ROUTE}/plans`;
export const GET_OWN_PLAN_ROUTE = `${MEMBERS_ROUTE}/${SUBSCRIPTION_ROUTE}/plans/own`;
export const buildGetPlanRoute = (planId: string) =>
  `${MEMBERS_ROUTE}/${SUBSCRIPTION_ROUTE}/plans/${planId}`;
export const buildChangePlanRoute = (planId: string) =>
  `${MEMBERS_ROUTE}/${SUBSCRIPTION_ROUTE}/plans/${planId}`;
export const GET_CARDS_ROUTE = `${MEMBERS_ROUTE}/${SUBSCRIPTION_ROUTE}/cards`;
export const buildSetDefaultCardRoute = (cardId: string) =>
  `${MEMBERS_ROUTE}/${SUBSCRIPTION_ROUTE}/cards/${cardId}/default`;
export const CREATE_SETUP_INTENT_ROUTE = `${MEMBERS_ROUTE}/${SUBSCRIPTION_ROUTE}/setup-intent`;
export const GET_CURRENT_CUSTOMER = `${MEMBERS_ROUTE}/${SUBSCRIPTION_ROUTE}/customer/current`;
export const buildItemPublishRoute = (itemId: UUID, notification?: boolean) =>
  `${ITEMS_ROUTE}/${itemId}/publish${qs.stringify(
    { notification },
    { addQueryPrefix: true },
  )}`;

export const API_ROUTES = {
  APPS_ROUTE,
  ITEMS_ROUTE,
  SHARED_ITEM_WITH_ROUTE,
  GET_OWN_ITEMS_ROUTE,
  GET_RECYCLED_ITEMS_ROUTE,
  SIGN_OUT_ROUTE,
  GET_CURRENT_MEMBER_ROUTE,
  GET_TAGS_ROUTE,
  GET_FLAGS_ROUTE,
  GET_CATEGORY_TYPES_ROUTE,
  VALIDATION_ROUTE,
  GET_ITEM_VALIDATION_REVIEWS_ROUTE,
  GET_ITEM_VALIDATION_STATUSES_ROUTE,
  buildAppListRoute,
  buildGetMember,
  buildGetMembersRoute,
  buildDeleteMemberRoute,
  buildUpdateMemberPasswordRoute,
  buildUploadFilesRoute,
  buildDownloadFilesRoute,
  buildPostItemMembershipRoute,
  SIGN_IN_ROUTE,
  SIGN_IN_WITH_PASSWORD_ROUTE,
  SIGN_UP_ROUTE,
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
  buildGetMembersBy,
  buildDeleteItemTagRoute,
  buildDeleteItemRoute,
  buildDeleteItemsRoute,
  buildCopyItemRoute,
  buildCopyPublicItemRoute,
  buildCopyItemsRoute,
  buildExportItemRoute,
  buildExportPublicItemRoute,
  buildPatchMember,
  buildPostItemFlagRoute,
  buildEditItemMembershipRoute,
  buildDeleteItemMembershipRoute,
  buildGetPublicItemRoute,
  buildGetPublicChildrenRoute,
  buildGetItemChatRoute,
  buildPostItemChatMessageRoute,
  buildPatchItemChatMessageRoute,
  buildDeleteItemChatMessageRoute,
  buildClearItemChatRoute,
  buildRecycleItemRoute,
  buildRecycleItemsRoute,
  buildGetPublicItemsWithTag,
  buildGetPublicMember,
  buildGetPublicMembersRoute,
  buildRestoreItemsRoute,
  buildGetCategoriesRoute,
  buildGetCategoryRoute,
  buildGetItemCategoriesRoute,
  buildGetItemsInCategoryRoute,
  buildGetItemsByKeywordRoute,
  buildPostItemCategoryRoute,
  buildDeleteItemCategoryRoute,
  buildUploadItemThumbnailRoute,
  buildDownloadItemThumbnailRoute,
  buildDownloadPublicItemThumbnailRoute,
  buildUploadAvatarRoute,
  buildDownloadAvatarRoute,
  buildDownloadPublicAvatarRoute,
  buildImportZipRoute,
  buildImportH5PRoute,
  buildGetApiAccessTokenRoute,
  buildGetPublicApiAccessTokenRoute,
  buildPublicDownloadFilesRoute,
  buildGetPublicItemMembershipsForItemsRoute,
  buildGetLikedItemsRoute,
  buildGetLikeCountRoute,
  buildPostItemLikeRoute,
  buildDeleteItemLikeRoute,
  buildPostItemValidationRoute,
  buildUpdateItemValidationReviewRoute,
  buildGetActions,
  buildExportActions,
  buildGetInvitationRoute,
  buildPatchInvitationRoute,
  buildDeleteInvitationRoute,
  buildResendInvitationRoute,
  buildPostInvitationsRoute,
  buildGetItemInvitationsForItemRoute,
  buildGetPlanRoute,
  buildItemPublishRoute,
  buildPostManyItemMembershipsRoute,
};

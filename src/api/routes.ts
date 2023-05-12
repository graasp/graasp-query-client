import qs from 'qs';

import { ItemTagType, UUID } from '@graasp/sdk';

import { DEFAULT_THUMBNAIL_SIZE } from '../config/constants';
import { SearchFields } from '../types';

export const APPS_ROUTE = 'app-items';
export const ITEMS_ROUTE = 'items';
export const ITEM_MEMBERSHIPS_ROUTE = 'item-memberships';
export const MEMBERS_ROUTE = `members`;
export const SUBSCRIPTION_ROUTE = 'subscriptions';
export const GET_OWN_ITEMS_ROUTE = `${ITEMS_ROUTE}/own`;
export const INVITATIONS_ROUTE = `invitations`;
export const GET_RECYCLED_ITEMS_DATA_ROUTE = `${ITEMS_ROUTE}/recycled`;
export const SHARED_ITEM_WITH_ROUTE = `${ITEMS_ROUTE}/shared-with`;
export const CATEGORIES_ROUTE = `${ITEMS_ROUTE}/categories`;
export const ETHERPAD_ROUTE = `${ITEMS_ROUTE}/etherpad`;
export const COLLECTIONS_ROUTE = `collections`;
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
export const buildGetItemParents = (id: UUID) => `${ITEMS_ROUTE}/${id}/parents`;
export const buildGetItemDescendants = (id: UUID) =>
  `${ITEMS_ROUTE}/${id}/descendants`;
export const buildGetItemsRoute = (ids: UUID[]) =>
  `${ITEMS_ROUTE}?${qs.stringify({ id: ids }, { arrayFormat: 'repeat' })}`;
export const buildMoveItemRoute = (id: UUID) => `${ITEMS_ROUTE}/${id}/move`;
export const buildMoveItemsRoute = (ids: UUID[]) =>
  `${ITEMS_ROUTE}/move?${qs.stringify({ id: ids }, { arrayFormat: 'repeat' })}`;
export const buildCopyItemRoute = (id: UUID) => `${ITEMS_ROUTE}/${id}/copy`;
export const buildCopyItemsRoute = (ids: UUID[]) =>
  `${ITEMS_ROUTE}/copy?${qs.stringify({ id: ids }, { arrayFormat: 'repeat' })}`;
export const buildEditItemRoute = (id: UUID) => `${ITEMS_ROUTE}/${id}`;
export const buildExportItemRoute = (id: UUID) =>
  `${ITEMS_ROUTE}/zip-export/${id}`;
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
export const buildGetItemInvitationsForItemRoute = (id: UUID) =>
  `${ITEMS_ROUTE}/${id}/invitations`;

export const buildGetItemChatRoute = (id: UUID) => `${ITEMS_ROUTE}/${id}/chat`;
export const buildExportItemChatRoute = (id: UUID) =>
  `${ITEMS_ROUTE}/${id}/export/chat`;
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
export const buildUploadFilesRoute = (parentId?: UUID) =>
  `${ITEMS_ROUTE}/upload${qs.stringify(
    { id: parentId },
    { addQueryPrefix: true },
  )}`;
export const buildImportZipRoute = (parentId?: UUID) =>
  `${ITEMS_ROUTE}/zip-import${qs.stringify(
    { parentId },
    { addQueryPrefix: true },
  )}`;
export const buildImportH5PRoute = (parentId?: UUID) =>
  `${ITEMS_ROUTE}/h5p-import${qs.stringify(
    { parentId },
    { addQueryPrefix: true },
  )}`;
export const buildDownloadFilesRoute = (id: UUID) =>
  `${ITEMS_ROUTE}/${id}/download`;
export const buildUploadAvatarRoute = () => `${MEMBERS_ROUTE}/avatar`;
export const buildDownloadAvatarRoute = ({
  id,
  replyUrl,
  size = DEFAULT_THUMBNAIL_SIZE,
}: {
  id: UUID;
  replyUrl: boolean;
  size?: string;
}) =>
  `${MEMBERS_ROUTE}/${id}/avatar/${size}${qs.stringify(
    { replyUrl },
    { addQueryPrefix: true },
  )}`;
export const buildUploadItemThumbnailRoute = (id: UUID) =>
  `${ITEMS_ROUTE}/${id}/thumbnails`;
export const buildDownloadItemThumbnailRoute = ({
  id,
  replyUrl,
  size = DEFAULT_THUMBNAIL_SIZE,
}: {
  id: UUID;
  replyUrl?: boolean;
  size?: string;
}) =>
  `${ITEMS_ROUTE}/${id}/thumbnails/${size}${qs.stringify(
    { replyUrl },
    { addQueryPrefix: true },
  )}`;

export const GET_CURRENT_MEMBER_ROUTE = `${MEMBERS_ROUTE}/current`;
export const SIGN_IN_ROUTE = `login`;
export const SIGN_IN_WITH_PASSWORD_ROUTE = `login-password`;
export const SIGN_UP_ROUTE = `register`;
export const SIGN_OUT_ROUTE = 'logout';
export const buildGetItemTagsRoute = (id: UUID) => `${ITEMS_ROUTE}/${id}/tags`;
export const buildGetItemsTagsRoute = (ids: UUID[]) =>
  `${ITEMS_ROUTE}/tags?${qs.stringify({ id: ids }, { arrayFormat: 'repeat' })}`;
export const buildPostItemTagRoute = ({
  itemId,
  type,
}: {
  itemId: UUID;
  type: ItemTagType;
}) => `${ITEMS_ROUTE}/${itemId}/tags/${type}`;
export const buildPutItemLoginSchemaRoute = (id: UUID) =>
  `${ITEMS_ROUTE}/${id}/login-schema`;
export const buildGetItemLoginSchemaRoute = (id: UUID) =>
  `${ITEMS_ROUTE}/${id}/login-schema`;
export const buildGetItemLoginSchemaTypeRoute = (id: UUID) =>
  `${ITEMS_ROUTE}/${id}/login-schema-type`;
export const buildDeleteItemTagRoute = ({
  itemId,
  type,
}: {
  itemId: UUID;
  type: ItemTagType;
}) => `${ITEMS_ROUTE}/${itemId}/tags/${type}`;
export const buildPostItemLoginSignInRoute = (id: UUID) =>
  `${ITEMS_ROUTE}/${id}/login`;
export const GET_TAGS_ROUTE = `${ITEMS_ROUTE}/tags/list`;
// export const buildGetItemLoginRoute = (id: UUID) =>
//   `${ITEMS_ROUTE}/${id}/login-schema`;
export const buildDeleteItemLoginSchemaRoute = (id: UUID) =>
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

export const buildRestoreItemsRoute = (ids: UUID[]) =>
  `${ITEMS_ROUTE}/restore${qs.stringify(
    { id: ids },
    {
      arrayFormat: 'repeat',
      addQueryPrefix: true,
    },
  )}`;

export const GET_CATEGORY_TYPES_ROUTE = `${ITEMS_ROUTE}/category-types`;
export const buildGetCategoriesRoute = (ids?: UUID[]) =>
  `${CATEGORIES_ROUTE}${qs.stringify(
    { typeId: ids },
    {
      arrayFormat: 'repeat',
      addQueryPrefix: true,
    },
  )}`;
export const buildGetCategoryRoute = (id: UUID) => `${CATEGORIES_ROUTE}/${id}`;
export const buildGetItemCategoriesRoute = (id: UUID) =>
  `${ITEMS_ROUTE}/${id}/categories`;
export const buildGetItemsInCategoryRoute = (ids: UUID[]) =>
  `${ITEMS_ROUTE}/with-categories${qs.stringify(
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

export const buildGetItemsByKeywordRoute = (fields: SearchFields) =>
  `${ITEMS_ROUTE}/${COLLECTIONS_ROUTE}/search${qs.stringify(fields, {
    addQueryPrefix: true,
  })}`;

export const buildGetLikesForMemberRoute = (id: UUID) =>
  `${ITEMS_ROUTE}/liked${qs.stringify(
    { memberId: id },
    {
      addQueryPrefix: true,
    },
  )}`;
export const buildGetItemLikesRoute = (id: UUID) =>
  `${ITEMS_ROUTE}/${id}/likes`;
export const buildPostItemLikeRoute = (itemId: UUID) =>
  `${ITEMS_ROUTE}/${itemId}/like`;
export const buildDeleteItemLikeRoute = (itemId: UUID) =>
  `${ITEMS_ROUTE}/${itemId}/like`;

export const VALIDATION_ROUTE = 'validations';
export const buildGetLastItemValidationGroupRoute = (id: UUID) =>
  `${ITEMS_ROUTE}/${id}/${VALIDATION_ROUTE}/latest`;
export const buildGetItemValidationAndReviewRoute = (id: UUID) =>
  `${ITEMS_ROUTE}/${VALIDATION_ROUTE}/status/${id}`;
export const buildGetItemValidationGroupsRoute = (id: UUID) =>
  `${ITEMS_ROUTE}/${VALIDATION_ROUTE}/groups/${id}`;
export const GET_ITEM_VALIDATION_REVIEWS_ROUTE = `${ITEMS_ROUTE}/${VALIDATION_ROUTE}/reviews`;
export const GET_ITEM_VALIDATION_STATUSES_ROUTE = `${ITEMS_ROUTE}/${VALIDATION_ROUTE}/statuses`;
export const GET_ITEM_VALIDATION_REVIEW_STATUSES_ROUTE = `${ITEMS_ROUTE}/${VALIDATION_ROUTE}/review/statuses`;
export const buildPostItemValidationRoute = (id: UUID) =>
  `${ITEMS_ROUTE}/${id}/validate`;
export const buildUpdateItemValidationReviewRoute = (id: UUID) =>
  `${ITEMS_ROUTE}/${VALIDATION_ROUTE}/${id}/review`;
export const buildGetActions = (
  itemId: UUID,
  options: { requestedSampleSize: number; view: string },
) =>
  `${ITEMS_ROUTE}/${itemId}/actions${qs.stringify(
    {
      requestedSampleSize: options.requestedSampleSize,
      view: options.view,
    },
    {
      addQueryPrefix: true,
    },
  )}`;
export const buildExportActions = (itemId: UUID) =>
  `${ITEMS_ROUTE}/${itemId}/actions/export`;
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
  // do not include notification query string if false
  `${ITEMS_ROUTE}/${COLLECTIONS_ROUTE}/${itemId}/publish${
    notification ? qs.stringify({ notification }, { addQueryPrefix: true }) : ''
  }`;
export const buildItemUnpublishRoute = (itemId: UUID) =>
  `${ITEMS_ROUTE}/${COLLECTIONS_ROUTE}/${itemId}/unpublish`;

export const buildGetItemPublishedInformationRoute = (itemId: UUID) =>
  `${ITEMS_ROUTE}/${COLLECTIONS_ROUTE}/${itemId}/informations`;
export const buildManyGetItemPublishedInformationsRoute = (itemIds: UUID[]) =>
  `${ITEMS_ROUTE}/${COLLECTIONS_ROUTE}/informations${qs.stringify(
    { itemId: itemIds },
    {
      arrayFormat: 'repeat',
      addQueryPrefix: true,
    },
  )}`;
export const buildGetAllPublishedItemsRoute = (categoryIds?: UUID[]) =>
  `${ITEMS_ROUTE}/${COLLECTIONS_ROUTE}${
    categoryIds?.length
      ? qs.stringify(
          { categoryIds },
          {
            arrayFormat: 'repeat',
            addQueryPrefix: true,
          },
        )
      : ''
  }`;
export const buildGetPublishedItemsForMemberRoute = (memberId: UUID) =>
  `${ITEMS_ROUTE}/${COLLECTIONS_ROUTE}/members/${memberId}`;

export const buildPostEtherpadRoute = (parentId?: UUID) =>
  `${ETHERPAD_ROUTE}/create${qs.stringify(
    { parentId },
    { addQueryPrefix: true },
  )}`;
export const buildGetEtherpadRoute = (itemId: UUID) =>
  `${ETHERPAD_ROUTE}/view/${itemId}`;

export const API_ROUTES = {
  // buildGetItemLoginRoute,
  APPS_ROUTE,
  buildAppListRoute,
  buildClearItemChatRoute,
  buildCopyItemRoute,
  buildCopyItemsRoute,
  buildDeleteInvitationRoute,
  buildDeleteItemCategoryRoute,
  buildDeleteItemChatMessageRoute,
  buildDeleteItemLikeRoute,
  buildDeleteItemLoginSchemaRoute,
  buildDeleteItemMembershipRoute,
  buildDeleteItemRoute,
  buildDeleteItemsRoute,
  buildDeleteItemTagRoute,
  buildDeleteMemberRoute,
  buildDownloadAvatarRoute,
  buildDownloadFilesRoute,
  buildDownloadItemThumbnailRoute,
  buildEditItemMembershipRoute,
  buildEditItemRoute,
  buildExportActions,
  buildExportItemChatRoute,
  buildExportItemRoute,
  buildGetActions,
  buildGetApiAccessTokenRoute,
  buildGetCategoriesRoute,
  buildGetCategoryRoute,
  buildGetChildrenRoute,
  buildGetEtherpadRoute,
  buildGetInvitationRoute,
  buildGetItemCategoriesRoute,
  buildGetItemChatRoute,
  buildGetItemInvitationsForItemRoute,
  buildGetItemLikesRoute,
  buildGetItemLoginSchemaRoute,
  buildGetItemLoginSchemaTypeRoute,
  buildGetItemMembershipsForItemsRoute,
  buildGetItemPublishedInformationRoute,
  buildGetItemRoute,
  buildGetItemsByKeywordRoute,
  buildGetItemsInCategoryRoute,
  buildGetItemTagsRoute,
  buildGetLastItemValidationGroupRoute,
  buildGetLikesForMemberRoute,
  buildGetMember,
  buildGetMembersBy,
  buildGetMembersRoute,
  buildGetPlanRoute,
  buildGetPublishedItemsForMemberRoute,
  buildImportH5PRoute,
  buildImportZipRoute,
  buildItemPublishRoute,
  buildItemUnpublishRoute,
  buildMoveItemRoute,
  buildMoveItemsRoute,
  buildPatchInvitationRoute,
  buildPatchItemChatMessageRoute,
  buildPatchMember,
  buildPostEtherpadRoute,
  buildPostInvitationsRoute,
  buildPostItemCategoryRoute,
  buildPostItemChatMessageRoute,
  buildPostItemFlagRoute,
  buildPostItemLikeRoute,
  buildPostItemLoginSignInRoute,
  buildPostItemMembershipRoute,
  buildPostItemRoute,
  buildPostItemTagRoute,
  buildPostItemValidationRoute,
  buildPostManyItemMembershipsRoute,
  buildPutItemLoginSchemaRoute,
  buildRecycleItemRoute,
  buildRecycleItemsRoute,
  buildResendInvitationRoute,
  buildRestoreItemsRoute,
  buildUpdateItemValidationReviewRoute,
  buildUpdateMemberPasswordRoute,
  buildUploadAvatarRoute,
  buildUploadFilesRoute,
  buildUploadItemThumbnailRoute,
  GET_CATEGORY_TYPES_ROUTE,
  GET_CURRENT_MEMBER_ROUTE,
  GET_FLAGS_ROUTE,
  GET_ITEM_VALIDATION_REVIEWS_ROUTE,
  GET_ITEM_VALIDATION_STATUSES_ROUTE,
  GET_OWN_ITEMS_ROUTE,
  GET_RECYCLED_ITEMS_DATA_ROUTE,
  GET_TAGS_ROUTE,
  ITEMS_ROUTE,
  SHARED_ITEM_WITH_ROUTE,
  SIGN_IN_ROUTE,
  SIGN_IN_WITH_PASSWORD_ROUTE,
  SIGN_OUT_ROUTE,
  SIGN_UP_ROUTE,
  VALIDATION_ROUTE,
};

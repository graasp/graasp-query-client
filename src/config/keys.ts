import { UUID } from '@graasp/sdk';

import { SearchFields } from '../types';
import { hashItemsIds } from '../utils/item';
import { DEFAULT_THUMBNAIL_SIZE } from './constants';

export const APPS_KEY = 'apps';
export const ITEMS_KEY = 'items';
export const OWN_ITEMS_KEY = [ITEMS_KEY, 'own'];
export const ETHERPADS_KEY = 'etherpads';
export const SUBSCRIPTION_KEY = 'subscriptions';

export const buildItemKey = (id?: UUID) => [ITEMS_KEY, id];
export const buildItemsKey = (ids: UUID[]) => [ITEMS_KEY, hashItemsIds(ids)];
export const buildItemChildrenKey = (id?: UUID) => [ITEMS_KEY, id, 'children'];
export const buildItemPaginatedChildrenKey = (id?: UUID) => [
  ITEMS_KEY,
  id,
  'childrenPaginated',
];
export const buildItemsChildrenKey = (ids: UUID[]) => [
  ITEMS_KEY,
  hashItemsIds(ids),
  'children',
];
export const buildItemDescendantsKey = (id: UUID) => [
  ITEMS_KEY,
  id,
  'descendants',
];
export const SHARED_ITEMS_KEY = 'shared';
export const CURRENT_MEMBER_KEY = 'currentMember';
export const MEMBERS_KEY = 'members';
export const buildMemberKey = (id?: UUID) => [MEMBERS_KEY, id];
export const buildMembersKey = (ids: UUID[]) => [
  MEMBERS_KEY,
  hashItemsIds(ids),
];
export const buildItemParentsKey = (id: UUID) => [ITEMS_KEY, id, 'parents'];
export const CHATS_KEY = 'chats';
export const buildItemChatKey = (id: UUID) => [CHATS_KEY, id];
export const EXPORT_CHATS_KEY = 'exportChats';
export const buildExportItemChatKey = (id: UUID) => [EXPORT_CHATS_KEY, id];
export const MENTIONS_KEY = 'mentions';
export const buildMentionKey = (memberId: UUID) => [MENTIONS_KEY, memberId];

export const getKeyForParentId = (parentId: UUID | null) =>
  parentId ? buildItemChildrenKey(parentId) : OWN_ITEMS_KEY;

export const buildItemMembershipsKey = (id?: UUID) => [
  ITEMS_KEY,
  id,
  'memberships',
];
export const buildManyItemMembershipsKey = (ids?: UUID[]) => [
  ITEMS_KEY,
  hashItemsIds(ids),
  'memberships',
];
export const buildItemLoginKey = (id?: UUID) => [ITEMS_KEY, id, 'login'];
export const buildItemLoginSchemaKey = (id?: UUID) => [
  ITEMS_KEY,
  id,
  'loginSchema',
];
export const buildItemLoginSchemaTypeKey = (id?: UUID) => [
  ...buildItemLoginSchemaKey(id),
  'type',
];
export const TAGS_KEY = 'tags';
export const ITEM_TAGS_KEY = 'itemTags';
export const itemTagsKeys = {
  all: [ITEMS_KEY, ITEM_TAGS_KEY] as const,
  many: () => [...itemTagsKeys.all, 'many'] as const,
  single: () => [...itemTagsKeys.all, 'single'] as const,
  singleId: (id?: UUID) => [...itemTagsKeys.single(), id] as const,
  manyIds: (ids: UUID[]) => [...itemTagsKeys.many(), ...ids] as const,
};
/**
 * @deprecated
 */
export const buildItemTagsKey = (id?: UUID) => [ITEMS_KEY, id, 'tags'];
/**
 * @deprecated
 */
export const buildManyItemTagsKey = (ids?: UUID[]) => [
  ITEMS_KEY,
  hashItemsIds(ids),
  'tags',
];
export const buildFileContentKey = ({
  id,
  replyUrl,
}: {
  id?: UUID;
  replyUrl?: boolean;
}) => [ITEMS_KEY, id, 'file', replyUrl ? 'url' : 'blob'];

export const ITEM_FLAGS_KEY = 'itemFlags';
export const buildItemFlagsKey = (id: UUID) => [ITEMS_KEY, id, 'flags'];

export const CATEGORY_TYPES_KEY = 'categoryTypes';
export const buildCategoryKey = (id: UUID) => ['category', id];
export const buildCategoriesKey = (typeId?: UUID[]) => [
  'categories',
  hashItemsIds(typeId),
];
export const buildItemCategoriesKey = (id?: UUID) => [
  ITEMS_KEY,
  id,
  'categories',
];
export const buildItemsByCategoriesKey = (ids: UUID[]) => [
  'itemsInCategories',
  hashItemsIds(ids),
];

export const buildSearchByKeywordKey = (fields: SearchFields) => [
  'keywordSearch',
  fields,
];

export const RECYCLED_ITEMS_DATA_KEY = 'recycledItemsData';
export const buildItemThumbnailKey = ({
  id,
  size = DEFAULT_THUMBNAIL_SIZE,
  replyUrl,
}: {
  id?: UUID;
  size?: string;
  replyUrl?: boolean;
}) => [ITEMS_KEY, id, 'thumbnails', size, replyUrl ? 'url' : 'blob'];
export const buildAvatarKey = ({
  id,
  replyUrl,
  size = DEFAULT_THUMBNAIL_SIZE,
}: {
  id?: UUID;
  size?: string;
  replyUrl: boolean;
}) => [MEMBERS_KEY, id, 'avatars', size, replyUrl ? 'url' : 'blob'];

export const buildGetLikesForMemberKey = (id?: UUID) => [
  MEMBERS_KEY,
  id,
  'likedItems',
];
export const buildGetLikesForItem = (id?: UUID) => [ITEMS_KEY, id, 'likes'];

export const buildPublishedItemsKey = (categoryIds?: UUID[]) => [
  ITEMS_KEY,
  'collections',
  hashItemsIds(categoryIds),
];
export const buildPublishedItemsForMemberKey = (memberId?: UUID) => [
  ITEMS_KEY,
  'collections',
  MEMBERS_KEY,
  memberId,
];

export const buildItemPublishedInformationKey = (id: UUID) => [
  ITEMS_KEY,
  id,
  'publishedInformation',
];

export const buildLastItemValidationGroupKey = (id: UUID) => [
  ITEMS_KEY,
  id,
  'itemValidation',
  'latest',
];

export const buildItemValidationAndReviewKey = (id: UUID) => [
  ITEMS_KEY,
  id,
  'itemValidationAndReview',
];
export const buildItemValidationGroupsKey = (id: UUID) => [
  ITEMS_KEY,
  id,
  'itemValidationGroups',
];

export const buildActionsKey = (args: {
  itemId: UUID;
  view: string;
  requestedSampleSize: number;
}) => [
  'actions',
  args.itemId,
  {
    view: args.view,
    size: args.requestedSampleSize,
  },
];

export const buildInvitationKey = (id?: UUID) => ['invitations', id];
export const buildItemInvitationsKey = (id?: UUID) => [
  ITEMS_KEY,
  id,
  'invitations',
];

export const PLANS_KEY = [SUBSCRIPTION_KEY, 'plans'];
export const OWN_PLAN_KEY = [SUBSCRIPTION_KEY, 'ownPlan'];
export const CARDS_KEY = [SUBSCRIPTION_KEY, 'cards'];
export const buildPlanKey = (id: string) => [
  MEMBERS_KEY,
  SUBSCRIPTION_KEY,
  id,
  'plans',
];
export const buildPlansKey = (id: string) => [
  MEMBERS_KEY,
  SUBSCRIPTION_KEY,
  id,
  'plans',
];
export const CURRENT_CUSTOMER_KEY = [SUBSCRIPTION_KEY, 'currentCustomer'];

export const buildEtherpadKey = (itemId?: UUID) => [ETHERPADS_KEY, itemId];

export const DATA_KEYS = {
  APPS_KEY,
  ITEMS_KEY,
  OWN_ITEMS_KEY,
  buildItemKey,
  buildItemsKey,
  buildItemChildrenKey,
  buildItemsChildrenKey,
  SHARED_ITEMS_KEY,
  CURRENT_MEMBER_KEY,
  MEMBERS_KEY,
  buildMemberKey,
  buildMembersKey,
  buildItemParentsKey,
  CHATS_KEY,
  buildItemChatKey,
  buildMentionKey,
  getKeyForParentId,
  buildItemMembershipsKey,
  buildManyItemMembershipsKey,
  buildItemLoginKey,
  TAGS_KEY,
  ITEM_TAGS_KEY,
  itemTagsKeys,
  buildItemTagsKey,
  buildManyItemTagsKey,
  buildFileContentKey,
  ITEM_FLAGS_KEY,
  buildItemFlagsKey,
  CATEGORY_TYPES_KEY,
  buildCategoryKey,
  buildCategoriesKey,
  buildItemCategoriesKey,
  buildItemsByCategoriesKey,
  buildSearchByKeywordKey,
  RECYCLED_ITEMS_DATA_KEY,
  buildItemThumbnailKey,
  buildAvatarKey,
  buildGetLikesForMemberKey,
  buildGetLikesForItem,
  buildItemValidationAndReviewKey,
  buildItemValidationGroupsKey,
  buildLastItemValidationGroupKey,
  buildInvitationKey,
  buildItemInvitationsKey,
  CARDS_KEY,
  buildPlanKey,
  buildPublishedItemsKey,
  buildEtherpadKey,
};

/** @deprecated use corresponding hook mutation instead, (ie: POST_ITEM -> usePostItem)  */
export const MUTATION_KEYS = {
  POST_ITEM: 'postItem',
  EDIT_ITEM: 'editItem',
  DELETE_ITEM: 'deleteItem',
  DELETE_ITEMS: 'deleteItems',
  COPY_ITEM: 'copyItem',
  COPY_ITEMS: 'copyItems',
  MOVE_ITEM: 'moveItem',
  MOVE_ITEMS: 'moveItems',
  UPLOAD_FILES: 'uploadFiles',
  SIGN_OUT: 'signOut',
  SIGN_IN: 'signIn',
  SIGN_IN_WITH_PASSWORD: 'signInWithPassword',
  SIGN_UP: 'signUp',
  POST_ITEM_LOGIN: 'postItemLoginSignIn',
  DELETE_ITEM_TAG: 'deleteItemTag',
  POST_ITEM_TAG: 'postItemTags',
  PUT_ITEM_LOGIN_SCHEMA: 'putItemLogin',
  DELETE_ITEM_LOGIN_SCHEMA: 'deleteItemLoginSchema',
  EDIT_MEMBER: 'editMember',
  DELETE_MEMBER: 'deleteMember',
  POST_ITEM_FLAG: 'postItemFlag',
  POST_ITEM_MEMBERSHIP: 'postItemMembership',
  EDIT_ITEM_MEMBERSHIP: 'editItemMembership',
  DELETE_ITEM_MEMBERSHIP: 'deleteItemMembership',
  POST_ITEM_CHAT_MESSAGE: 'postChatMessage',
  PATCH_ITEM_CHAT_MESSAGE: 'patchChatMessage',
  DELETE_ITEM_CHAT_MESSAGE: 'deleteChatMessage',
  CLEAR_ITEM_CHAT: 'clearItemChat',
  PATCH_MENTION: 'patchMention',
  DELETE_MENTION: 'deleteMention',
  CLEAR_MENTIONS: 'clearMentions',
  RECYCLE_ITEM: 'recycleItem',
  RECYCLE_ITEMS: 'recycleItems',
  RESTORE_ITEMS: 'restoreItems',
  POST_ITEM_CATEGORY: 'postItemCategory',
  DELETE_ITEM_CATEGORY: 'deleteItemCategory',
  UPLOAD_ITEM_THUMBNAIL: 'uploadItemThumbnail',
  UPLOAD_AVATAR: 'uploadAvatar',
  IMPORT_ZIP: 'importZip',
  EXPORT_ZIP: 'exportZip',
  IMPORT_H5P: 'importH5P',
  POST_ETHERPAD: 'postEtherpad',
  POST_ITEM_LIKE: 'postItemLike',
  DELETE_ITEM_LIKE: 'deleteItemLike',
  ADD_FAVORITE_ITEM: 'addFavoriteItem',
  DELETE_FAVORITE_ITEM: 'deleteFavoriteItem',
  POST_ITEM_VALIDATION: 'postItemValidation',
  UPDATE_ITEM_VALIDATION_REVIEW: 'updateItemValidationReview',
  EXPORT_ACTIONS: 'exportActions',
  POST_INVITATIONS: 'postInvitations',
  PATCH_INVITATION: 'patchInvitation',
  DELETE_INVITATION: 'deleteInvitation',
  RESEND_INVITATION: 'resendInvitation',
  CHANGE_PLAN: 'subscriptionChangePlan',
  CREATE_SETUP_INTENT: 'subscriptionCreateSetupIntent',
  SET_DEFAULT_CARD: 'subscriptionSetDefaultCard',
  PUBLISH_ITEM: 'publishItem',
  UNPUBLISH_ITEM: 'unpublishItem',
  SWITCH_MEMBER: 'switchMember',
  UPDATE_PASSWORD: 'updatePassword',
  SHARE_ITEM: 'shareItem',
};

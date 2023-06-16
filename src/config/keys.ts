import { UUID } from '@graasp/sdk';

import { SearchFields } from '../types';
import { hashItemsIds } from '../utils/item';
import { DEFAULT_THUMBNAIL_SIZE } from './constants';

const ITEMS_CONTEXT = 'items';
const APPS_CONTEXT = 'apps';
const SHARED_ITEMS_CONTEXT = 'shared';
const CURRENT_MEMBER_CONTEXT = 'currentMember';
const MEMBERS_CONTEXT = 'members';
const CHATS_CONTEXT = 'chats';
const MENTIONS_CONTEXT = 'mentions';
const ITEM_FLAGS_CONTEXT = 'itemFlags';
const TAGS_CONTEXT = 'tags';
const ITEM_TAGS_CONTEXT = 'itemTags';
const CATEGORY_TYPES_CONTEXT = 'categoryTypes';
const ETHERPADS_CONTEXT = 'etherpads';
const ITEM_VALIDATION_REVIEWS_CONTEXT = 'itemValidationReviews';
const RECYCLED_ITEMS_CONTEXT = 'recycledItems';
const ITEM_VALIDATION_STATUSES_CONTEXT = 'itemValidationStatuses';
const ITEM_VALIDATION_REVIEW_STATUSES_CONTEXT = 'itemValidationReviewStatuses';
export const SUBSCRIPTION_CONTEXT = 'subscriptions';

export const APPS_KEY = [APPS_CONTEXT];
export const ITEMS_KEY = [ITEMS_CONTEXT];
export const OWN_ITEMS_KEY = [ITEMS_CONTEXT, 'own'];
export const ETHERPADS_KEY = [ETHERPADS_CONTEXT];
export const SUBSCRIPTION_KEY = [SUBSCRIPTION_CONTEXT];

export const buildItemKey = (id?: UUID) => [ITEMS_KEY, id];
export const buildItemsKey = (ids: UUID[]) => [ITEMS_KEY, hashItemsIds(ids)];
export const buildItemChildrenKey = (id?: UUID) => [ITEMS_KEY, 'children', id];
export const buildItemPaginatedChildrenKey = (id?: UUID) => [
  ITEMS_KEY,
  'childrenPaginated',
  id,
];
export const buildItemsChildrenKey = (ids: UUID[]) => [
  ITEMS_KEY,
  'children',
  hashItemsIds(ids),
];
export const buildItemDescendantsKey = (id: UUID) => [
  ITEMS_KEY,
  'descendants',
  id,
];
export const SHARED_ITEMS_KEY = [SHARED_ITEMS_CONTEXT];
export const CURRENT_MEMBER_KEY = [CURRENT_MEMBER_CONTEXT];
export const MEMBERS_KEY = [MEMBERS_CONTEXT];
export const buildMemberKey = (id?: UUID) => [MEMBERS_CONTEXT, id];
export const buildMembersKey = (ids: UUID[]) => [
  MEMBERS_CONTEXT,
  hashItemsIds(ids),
];
export const buildItemParentsKey = (id: UUID) => [ITEMS_CONTEXT, 'parents', id];
export const CHATS_KEY = [CHATS_CONTEXT];
export const buildItemChatKey = (id: UUID) => [CHATS_CONTEXT, id];
export const EXPORT_CHATS_CONTEXT = 'exportChats';
export const buildExportItemChatKey = (id: UUID) => [EXPORT_CHATS_CONTEXT, id];
export const MENTIONS_KEY = [MENTIONS_CONTEXT];
export const buildMentionKey = () => [MENTIONS_CONTEXT, 'own'];

export const getKeyForParentId = (parentId: UUID | null) =>
  parentId ? buildItemChildrenKey(parentId) : OWN_ITEMS_KEY;

export const buildItemMembershipsKey = (id?: UUID) => [
  ITEMS_CONTEXT,
  'memberships',
  id,
];
export const buildManyItemMembershipsKey = (ids?: UUID[]) => [
  ITEMS_CONTEXT,
  'memberships',
  hashItemsIds(ids),
];
export const buildItemLoginKey = (id?: UUID) => [ITEMS_CONTEXT, 'login', id];
export const buildItemLoginSchemaKey = (id?: UUID) => [
  ITEMS_CONTEXT,
  'loginSchema',
  id,
];
export const buildItemLoginSchemaTypeKey = (id?: UUID) => [
  ...buildItemLoginSchemaKey(id),
  'type',
];
export const TAGS_KEY = [TAGS_CONTEXT];
export const ITEM_TAGS_KEY = [ITEM_TAGS_CONTEXT];
export const itemTagsKeys = {
  all: [ITEMS_CONTEXT, ITEM_TAGS_CONTEXT] as const,
  many: () => [...itemTagsKeys.all, 'many'] as const,
  single: () => [...itemTagsKeys.all, 'single'] as const,
  singleId: (id?: UUID) => [...itemTagsKeys.single(), id] as const,
  manyIds: (ids: UUID[] | undefined = []) =>
    [...itemTagsKeys.many(), ...ids] as const,
};
export const buildFileContentKey = ({
  id,
  replyUrl,
}: {
  id?: UUID;
  replyUrl?: boolean;
}) => [ITEMS_CONTEXT, 'file', id, replyUrl ? 'url' : 'blob'];

export const ITEM_FLAGS_KEY = [ITEM_FLAGS_CONTEXT];
export const buildItemFlagsKey = (id: UUID) => [ITEMS_CONTEXT, 'flags', id];

export const CATEGORY_TYPES_KEY = [CATEGORY_TYPES_CONTEXT];
export const buildCategoryKey = (id: UUID) => ['category', id];
export const buildCategoriesKey = (typeId?: UUID[]) => [
  'categories',
  hashItemsIds(typeId),
];
export const buildItemCategoriesKey = (id?: UUID) => [
  ITEMS_CONTEXT,
  'categories',
  id,
];
export const buildItemsByCategoriesKey = (ids: UUID[]) => [
  'itemsInCategories',
  hashItemsIds(ids),
];

export const buildSearchByKeywordKey = (fields: SearchFields) => [
  'keywordSearch',
  fields,
];

export const RECYCLED_ITEMS_DATA_KEY = [RECYCLED_ITEMS_CONTEXT];
export const buildItemThumbnailKey = ({
  id,
  size = DEFAULT_THUMBNAIL_SIZE,
  replyUrl,
}: {
  id?: UUID;
  size?: string;
  replyUrl?: boolean;
}) => [ITEMS_CONTEXT, id, 'thumbnails', size, replyUrl ? 'url' : 'blob'];
export const buildAvatarKey = ({
  id,
  replyUrl,
  size = DEFAULT_THUMBNAIL_SIZE,
}: {
  id?: UUID;
  size?: string;
  replyUrl: boolean;
}) => [MEMBERS_CONTEXT, id, 'avatars', size, replyUrl ? 'url' : 'blob'];

export const buildGetLikesForMemberKey = (id?: UUID) => [
  MEMBERS_CONTEXT,
  'likedItems',
  id,
];
export const buildGetLikesForItem = (id?: UUID) => [ITEMS_CONTEXT, 'likes', id];

export const buildPublishedItemsKey = (categoryIds?: UUID[]) => [
  ITEMS_CONTEXT,
  'collections',
  hashItemsIds(categoryIds),
];
export const buildPublishedItemsForMemberKey = (memberId?: UUID) => [
  ITEMS_CONTEXT,
  'collections',
  MEMBERS_CONTEXT,
  memberId,
];

export const buildItemPublishedInformationKey = (id: UUID) => [
  ITEMS_CONTEXT,
  'publishedInformation',
  id,
];

export const buildManyItemPublishedInformationsKey = (ids: UUID[]) => [
  ITEMS_CONTEXT,
  'publishedInformation',
  ids,
];

export const buildLastItemValidationGroupKey = (id: UUID) => [
  ITEMS_CONTEXT,
  'itemValidation',
  'latest',
  id,
];

export const ITEM_VALIDATION_REVIEWS_KEY = [ITEM_VALIDATION_REVIEWS_CONTEXT];
export const ITEM_VALIDATION_STATUSES_KEY = [ITEM_VALIDATION_STATUSES_CONTEXT];
export const ITEM_VALIDATION_REVIEW_STATUSES_KEY = [
  ITEM_VALIDATION_REVIEW_STATUSES_CONTEXT,
];
export const buildItemValidationAndReviewKey = (id: UUID) => [
  ITEMS_CONTEXT,
  id,
  'itemValidationAndReview',
];
export const buildItemValidationGroupsKey = (id: UUID) => [
  ITEMS_CONTEXT,
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
  ITEMS_CONTEXT,
  id,
  'invitations',
];

export const PLANS_KEY = [SUBSCRIPTION_CONTEXT, 'plans'];
export const OWN_PLAN_KEY = [SUBSCRIPTION_CONTEXT, 'ownPlan'];
export const CARDS_KEY = [SUBSCRIPTION_CONTEXT, 'cards'];
export const buildPlanKey = (id: string) => [
  MEMBERS_CONTEXT,
  SUBSCRIPTION_CONTEXT,
  'plans',
  id,
];
export const buildPlansKey = (id: string) => [
  MEMBERS_CONTEXT,
  SUBSCRIPTION_CONTEXT,
  'plans',
  id,
];
export const CURRENT_CUSTOMER_KEY = [SUBSCRIPTION_CONTEXT, 'currentCustomer'];

export const buildEtherpadKey = (itemId?: UUID) => [ETHERPADS_CONTEXT, itemId];

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
  buildFileContentKey,
  ITEM_FLAGS_KEY,
  buildItemFlagsKey,
  CATEGORY_TYPES_KEY,
  buildCategoryKey,
  buildCategoriesKey,
  buildItemCategoriesKey,
  buildItemsByCategoriesKey,
  buildSearchByKeywordKey,
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
  POST_ITEM: [ITEMS_CONTEXT, 'post'],
  EDIT_ITEM: [ITEMS_CONTEXT, 'edit'],
  DELETE_ITEMS: [ITEMS_CONTEXT, 'deleteMany'],
  COPY_PUBLIC_ITEM: [ITEMS_CONTEXT, 'copyPublic'],
  COPY_ITEMS: [ITEMS_CONTEXT, 'copyMany'],
  MOVE_ITEMS: [ITEMS_CONTEXT, 'moveMany'],
  UPLOAD_FILES: ['uploadFiles'],
  SIGN_OUT: [MEMBERS_CONTEXT, 'signOut'],
  SIGN_IN: [MEMBERS_CONTEXT, 'signIn'],
  SIGN_IN_WITH_PASSWORD: [MEMBERS_CONTEXT, 'signInWithPassword'],
  SIGN_UP: [MEMBERS_CONTEXT, 'signUp'],
  POST_ITEM_LOGIN: ['postItemLoginSignIn'],
  DELETE_ITEM_TAG: [ITEM_TAGS_CONTEXT, 'delete'],
  POST_ITEM_TAG: [ITEM_TAGS_CONTEXT, 'postMany'],
  PUT_ITEM_LOGIN_SCHEMA: ['putItemLogin'],
  DELETE_ITEM_LOGIN_SCHEMA: ['deleteItemLoginSchema'],
  EDIT_MEMBER: [MEMBERS_CONTEXT, 'edit'],
  DELETE_MEMBER: [MEMBERS_CONTEXT, 'delete'],
  POST_ITEM_FLAG: [ITEM_FLAGS_CONTEXT, 'postItemFlag'],
  POST_ITEM_MEMBERSHIP: [ITEMS_CONTEXT, 'postItemMembership'],
  EDIT_ITEM_MEMBERSHIP: [ITEMS_CONTEXT, 'editItemMembership'],
  DELETE_ITEM_MEMBERSHIP: [ITEMS_CONTEXT, 'deleteItemMembership'],
  POST_ITEM_CHAT_MESSAGE: ['postChatMessage'],
  PATCH_ITEM_CHAT_MESSAGE: ['patchChatMessage'],
  DELETE_ITEM_CHAT_MESSAGE: ['deleteChatMessage'],
  CLEAR_ITEM_CHAT: ['clearItemChat'],
  PATCH_MENTION: ['patchMention'],
  DELETE_MENTION: ['deleteMention'],
  CLEAR_MENTIONS: ['clearMentions'],
  RECYCLE_ITEM: ['recycleItem'],
  RECYCLE_ITEMS: ['recycleItems'],
  RESTORE_ITEMS: ['restoreItems'],
  POST_ITEM_CATEGORY: ['postItemCategory'],
  DELETE_ITEM_CATEGORY: ['deleteItemCategory'],
  UPLOAD_ITEM_THUMBNAIL: ['uploadItemThumbnail'],
  UPLOAD_AVATAR: ['uploadAvatar'],
  IMPORT_ZIP: ['importZip'],
  EXPORT_ZIP: ['exportZip'],
  IMPORT_H5P: ['importH5P'],
  POST_ETHERPAD: ['postEtherpad'],
  POST_ITEM_LIKE: ['postItemLike'],
  DELETE_ITEM_LIKE: ['deleteItemLike'],
  ADD_FAVORITE_ITEM: ['addFavoriteItem'],
  DELETE_FAVORITE_ITEM: ['deleteFavoriteItem'],
  POST_ITEM_VALIDATION: ['postItemValidation'],
  UPDATE_ITEM_VALIDATION_REVIEW: ['updateItemValidationReview'],
  EXPORT_ACTIONS: ['exportActions'],
  POST_INVITATIONS: ['postInvitations'],
  PATCH_INVITATION: ['patchInvitation'],
  DELETE_INVITATION: ['deleteInvitation'],
  RESEND_INVITATION: ['resendInvitation'],
  CHANGE_PLAN: ['subscriptionChangePlan'],
  CREATE_SETUP_INTENT: ['subscriptionCreateSetupIntent'],
  SET_DEFAULT_CARD: ['subscriptionSetDefaultCard'],
  PUBLISH_ITEM: ['publishItem'],
  UNPUBLISH_ITEM: ['unpublishItem'],
  SWITCH_MEMBER: ['switchMember'],
  UPDATE_PASSWORD: ['updatePassword'],
  SHARE_ITEM: ['shareItem'],
};

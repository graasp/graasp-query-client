import type { UUID } from '../types';
import { hashItemsIds } from '../utils/item';
import { DEFAULT_THUMBNAIL_SIZES } from './constants';

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
const ITEM_VALIDATION_REVIEWS_CONTEXT = 'itemValidationReviews';
const RECYCLED_ITEMS_CONTEXT = 'recycledItems';
const ITEM_VALIDATION_STATUSES_CONTEXT = 'itemValidationStatuses';
const ITEM_VALIDATION_REVIEW_STATUSES_CONTEXT = 'itemValidationReviewStatuses';
export const SUBSCRIPTION_CONTEXT = 'subscriptions';

export const APPS_KEY = [APPS_CONTEXT];
export const ITEMS_KEY = [ITEMS_CONTEXT];
export const OWN_ITEMS_KEY = [ITEMS_CONTEXT, 'own'];
export const buildItemKey = (id?: UUID) => [ITEMS_CONTEXT, id];
export const buildItemsKey = (ids: UUID[]) => [
  ITEMS_CONTEXT,
  hashItemsIds(ids),
];
export const buildItemChildrenKey = (id?: UUID) => [
  ITEMS_CONTEXT,
  id,
  'children',
];
export const buildItemPaginatedChildrenKey = (id?: UUID) => [
  ITEMS_CONTEXT,
  id,
  'childrenPaginated',
];
export const buildItemsChildrenKey = (ids: UUID[]) => [
  ITEMS_CONTEXT,
  hashItemsIds(ids),
  'children',
];
export const SHARED_ITEMS_KEY = [SHARED_ITEMS_CONTEXT];
export const CURRENT_MEMBER_KEY = [CURRENT_MEMBER_CONTEXT];
export const MEMBERS_KEY = [MEMBERS_CONTEXT];
export const buildMemberKey = (id?: UUID) => [MEMBERS_CONTEXT, id];
export const buildMembersKey = (ids: UUID[]) => [
  MEMBERS_CONTEXT,
  hashItemsIds(ids),
];
export const buildItemParentsKey = (id: UUID) => [ITEMS_CONTEXT, id, 'parents'];
export const CHATS_KEY = [CHATS_CONTEXT];
export const buildItemChatKey = (id: UUID) => [CHATS_CONTEXT, id];
export const MENTIONS_KEY = [MENTIONS_CONTEXT];
export const buildMentionKey = (memberId: UUID) => [MENTIONS_CONTEXT, memberId];

export const getKeyForParentId = (parentId: UUID | null) =>
  parentId ? buildItemChildrenKey(parentId) : OWN_ITEMS_KEY;

export const buildItemMembershipsKey = (id?: UUID) => [
  ITEMS_CONTEXT,
  id,
  'memberships',
];
export const buildManyItemMembershipsKey = (ids?: UUID[]) => [
  ITEMS_CONTEXT,
  hashItemsIds(ids),
  'memberships',
];
export const buildItemLoginKey = (id?: UUID) => [ITEMS_CONTEXT, id, 'login'];
export const TAGS_KEY = [TAGS_CONTEXT];
export const ITEM_TAGS_KEY = [ITEM_TAGS_CONTEXT];
export const buildItemTagsKey = (id?: UUID) => [ITEMS_CONTEXT, id, 'tags'];
export const buildManyItemTagsKey = (ids?: UUID[]) => [
  ITEMS_CONTEXT,
  hashItemsIds(ids),
  'tags',
];
export const buildFileContentKey = (id?: UUID) => [
  ITEMS_CONTEXT,
  id,
  'content',
];
export const buildS3FileContentKey = (id?: UUID) => [
  ITEMS_CONTEXT,
  id,
  'content',
];

export const ITEM_FLAGS_KEY = [ITEM_FLAGS_CONTEXT];
export const buildItemFlagsKey = (id: UUID) => [ITEMS_CONTEXT, id, 'flags'];

export const CATEGORY_TYPES_KEY = [CATEGORY_TYPES_CONTEXT];
export const buildCategoryKey = (id: UUID) => ['category', id];
export const buildCategoriesKey = (typeId?: UUID[]) => [
  'categories',
  hashItemsIds(typeId),
];
export const buildItemCategoriesKey = (id?: UUID) => [
  ITEMS_CONTEXT,
  id,
  'categories',
];
export const buildItemsByCategoriesKey = (ids: UUID[]) => [
  'itemsInCategories',
  hashItemsIds(ids),
];

export const buildSearchByKeywordKey = (range: string, keywords: string) => [
  'keywordSearch',
  range,
  keywords,
];

export const buildPublicItemsWithTagKey = (id?: UUID) => [
  ITEMS_CONTEXT,
  ITEM_TAGS_CONTEXT,
  id,
];
export const RECYCLED_ITEMS_KEY = [RECYCLED_ITEMS_CONTEXT];
export const buildItemThumbnailKey = ({
  id,
  size = DEFAULT_THUMBNAIL_SIZES,
}: {
  id?: UUID;
  size?: string;
}) => [ITEMS_CONTEXT, id, 'thumbnails', size];
export const buildAvatarKey = ({
  id,
  size = DEFAULT_THUMBNAIL_SIZES,
}: {
  id?: UUID;
  size?: string;
}) => [MEMBERS_CONTEXT, id, 'avatars', size];

export const buildGetLikedItemsKey = (id: UUID) => [
  MEMBERS_CONTEXT,
  id,
  'likedItems',
];
export const buildGetLikeCountKey = (id: UUID) => [
  ITEMS_CONTEXT,
  id,
  'likeCount',
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

export const buildInvitationKey = (id: UUID) => ['invitations', id];
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
  id,
  'plans',
];
export const buildPlansKey = (id: string) => [
  MEMBERS_CONTEXT,
  SUBSCRIPTION_CONTEXT,
  id,
  'plans',
];
export const CURRENT_CUSTOMER_KEY = [SUBSCRIPTION_CONTEXT, 'currentCustomer'];

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
  buildItemTagsKey,
  buildManyItemTagsKey,
  buildFileContentKey,
  buildS3FileContentKey,
  ITEM_FLAGS_KEY,
  buildItemFlagsKey,
  CATEGORY_TYPES_KEY,
  buildCategoryKey,
  buildCategoriesKey,
  buildItemCategoriesKey,
  buildItemsByCategoriesKey,
  buildSearchByKeywordKey,
  buildPublicItemsWithTagKey,
  RECYCLED_ITEMS_KEY,
  buildItemThumbnailKey,
  buildAvatarKey,
  buildGetLikedItemsKey,
  buildGetLikeCountKey,
  ITEM_VALIDATION_REVIEWS_KEY,
  ITEM_VALIDATION_STATUSES_KEY,
  ITEM_VALIDATION_REVIEW_STATUSES_KEY,
  buildItemValidationAndReviewKey,
  buildItemValidationGroupsKey,
  buildInvitationKey,
  buildItemInvitationsKey,
  CARDS_KEY,
  buildPlanKey,
};

export const MUTATION_KEYS = {
  POST_ITEM: [ITEMS_CONTEXT, 'post'],
  EDIT_ITEM: [ITEMS_CONTEXT, 'edit'],
  DELETE_ITEM: [ITEMS_CONTEXT, 'delete'],
  DELETE_ITEMS: [ITEMS_CONTEXT, 'deleteMany'],
  COPY_ITEM: [ITEMS_CONTEXT, 'copy'],
  COPY_PUBLIC_ITEM: [ITEMS_CONTEXT, 'copyPublic'],
  COPY_ITEMS: [ITEMS_CONTEXT, 'copyMany'],
  MOVE_ITEM: [ITEMS_CONTEXT, 'move'],
  MOVE_ITEMS: [ITEMS_CONTEXT, 'moveMany'],
  UPLOAD_FILES: ['uploadFiles'],
  SIGN_OUT: [MEMBERS_CONTEXT, 'signOut'],
  SIGN_IN: [MEMBERS_CONTEXT, 'signIn'],
  SIGN_IN_WITH_PASSWORD: [MEMBERS_CONTEXT, 'signInWithPassword'],
  SIGN_UP: [MEMBERS_CONTEXT, 'signUp'],
  POST_ITEM_LOGIN: ['postItemLoginSignIn'],
  DELETE_ITEM_TAG: [ITEM_TAGS_CONTEXT, 'delete'],
  POST_ITEM_TAG: [ITEM_TAGS_CONTEXT, 'postMany'],
  PUT_ITEM_LOGIN: ['putItemLogin'],
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
  SWITCH_MEMBER: ['switchMember'],
  UPDATE_PASSWORD: ['updatePassword'],
  SHARE_ITEM: ['shareItem'],
};

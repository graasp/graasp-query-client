import type { UUID } from '../types';
import { hashItemsIds } from '../utils/item';
import { DEFAULT_THUMBNAIL_SIZES } from './constants';

export const APPS_KEY = 'apps';
export const ITEMS_KEY = 'items';
export const OWN_ITEMS_KEY = [ITEMS_KEY, 'own'];
export const buildItemKey = (id?: UUID) => [ITEMS_KEY, id];
export const buildItemsKey = (ids: UUID[]) => [ITEMS_KEY, hashItemsIds(ids)];
export const buildItemChildrenKey = (id?: UUID) => [ITEMS_KEY, id, 'children'];
export const buildItemsChildrenKey = (ids: UUID[]) => [
  ITEMS_KEY,
  hashItemsIds(ids),
  'children',
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
export const TAGS_KEY = 'tags';
export const ITEM_TAGS_KEY = 'itemTags';
export const buildItemTagsKey = (id?: UUID) => [ITEMS_KEY, id, 'tags'];
export const buildManyItemTagsKey = (ids?: UUID[]) => [
  ITEMS_KEY,
  hashItemsIds(ids),
  'tags',
];
export const buildFileContentKey = (id?: UUID) => [ITEMS_KEY, id, 'content'];
export const buildS3FileContentKey = (id?: UUID) => [ITEMS_KEY, id, 'content'];

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

export const buildSearchByKeywordKey = (range: string, keywords: string) => [
  'keywordSearch',
  range,
  keywords,
];

export const buildPublicItemsWithTagKey = (id?: UUID) => [
  ITEMS_KEY,
  ITEM_TAGS_KEY,
  id,
];
export const RECYCLED_ITEMS_KEY = 'recycledItems';
export const buildItemThumbnailKey = ({
  id,
  size = DEFAULT_THUMBNAIL_SIZES,
}: {
  id?: UUID;
  size?: string;
}) => [ITEMS_KEY, id, 'thumbnails', size];
export const buildAvatarKey = ({
  id,
  size = DEFAULT_THUMBNAIL_SIZES,
}: {
  id?: UUID;
  size?: string;
}) => [MEMBERS_KEY, id, 'avatars', size];

export const buildGetLikedItemsKey = (id: UUID) => [
  MEMBERS_KEY,
  id,
  'likedItems',
];
export const buildGetLikeCountKey = (id: UUID) => [ITEMS_KEY, id, 'likeCount'];

export const ITEM_VALIDATION_REVIEWS_KEY = 'itemValidationReviews';
export const ITEM_VALIDATION_STATUSES_KEY = 'itemValidationStatuses';
export const ITEM_VALIDATION_REVIEW_STATUSES_KEY =
  'itemValidationReviewStatuses';
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
  { view: args.view, size: args.requestedSampleSize },
];

export const buildInvitationKey = (id: UUID) => ['invitations', id];
export const buildItemInvitationsKey = (id?: UUID) => [
  ITEMS_KEY,
  id,
  'invitations',
];

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
};

export const MUTATION_KEYS = {
  POST_ITEM: 'postItem',
  EDIT_ITEM: 'editItem',
  DELETE_ITEM: 'deleteItem',
  DELETE_ITEMS: 'deleteItems',
  COPY_ITEM: 'copyItem',
  COPY_PUBLIC_ITEM: 'copyPublicItem',
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
  PUT_ITEM_LOGIN: 'putItemLogin',
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
  PUBLISH_ITEM: 'publishItem',
  SWITCH_MEMBER: 'switchMember',
  SHARE_ITEM: 'shareItem',
};

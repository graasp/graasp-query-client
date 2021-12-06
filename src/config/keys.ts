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
export const buildFileContentKey = (id?: UUID) => [ITEMS_KEY, id, 'content'];
export const buildS3FileContentKey = (id?: UUID) => [ITEMS_KEY, id, 'content'];

export const ITEM_FLAGS_KEY = 'itemFlags';
export const buildItemFlagsKey = (id: UUID) => [ITEMS_KEY, id, 'flags'];

export const CATEGORY_TYPES_KEY = 'categoryTypes'
export const buildCategoryKey = (id: UUID) => ['category', id];
export const buildCategoriesKey = (typeId?: UUID[]) => ['categories', hashItemsIds(typeId)];
export const buildItemCategoriesKey = (id?: UUID) => [ITEMS_KEY, id, 'categories'];
export const buildItemsByCategoriesKey = (ids: UUID[]) => ['itemsInCategories', hashItemsIds(ids)];

export const buildCustomizedTagsKey = (id: UUID) => ['customized-tags', id];

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
  SHARE_ITEM: 'shareItem',
  FILE_UPLOAD: 'fileUpload',
  SIGN_OUT: 'signOut',
  POST_ITEM_LOGIN: 'postItemLoginSignIn',
  buildItemMembershipsKey: (id: UUID) => [ITEMS_KEY, id, 'memberships'],
  DELETE_ITEM_TAG: 'deleteItemTag',
  POST_ITEM_TAG: 'postItemTags',
  PUT_ITEM_LOGIN: 'putItemLogin',
  EDIT_MEMBER: 'editMember',
  POST_ITEM_FLAG: 'postItemFlag',
  EDIT_ITEM_MEMBERSHIP: 'editItemMembership',
  DELETE_ITEM_MEMBERSHIP: 'deleteItemMembership',
  POST_ITEM_CHAT_MESSAGE: 'postChatMessage',
  RECYCLE_ITEM: 'recycleItem',
  RECYCLE_ITEMS: 'recycleItems',
  RESTORE_ITEMS: 'restoreItems',
  POST_ITEM_CATEGORY: 'postItemCategory',
  DELETE_ITEM_CATEGORY: 'deleteItemCategory',
  UPLOAD_ITEM_THUMBNAIL: 'uploadItemThumbnail',
  UPLOAD_AVATAR: 'uploadAvatar',
  POST_CUSTOMIZED_TAGS: 'postCustomizedTags',
};

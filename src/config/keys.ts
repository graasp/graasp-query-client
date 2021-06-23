import type { UUID } from '../types';

export const ITEMS_KEY = 'items';
export const OWN_ITEMS_KEY = [ITEMS_KEY, 'own'];
export const buildItemKey = (id: UUID) => [ITEMS_KEY, id];
export const buildItemChildrenKey = (id: UUID) => [ITEMS_KEY, id, 'children'];
export const SHARED_ITEMS_KEY = 'shared';
export const CURRENT_MEMBER_KEY = 'currentMember';
export const MEMBERS_KEY = 'members';
export const buildMemberKey = (id: UUID) => [MEMBERS_KEY, id];
export const buildItemParentsKey = (id: UUID) => [ITEMS_KEY, id, 'parents'];

export const getKeyForParentId = (parentId: UUID | null) =>
  parentId ? buildItemChildrenKey(parentId) : OWN_ITEMS_KEY;

export const buildItemMembershipsKey = (id: UUID) => [
  ITEMS_KEY,
  id,
  'memberships',
];
export const buildItemLoginKey = (id: UUID) => [ITEMS_KEY, id, 'login'];
export const ITEM_TAGS = 'itemTags';
export const buildItemTagsKey = (id: UUID) => [ITEMS_KEY, id, 'tags'];
export const buildFileContentKey = (id: UUID) => [ITEMS_KEY, id, 'content'];
export const buildS3FileContentKey = (id: UUID) => [ITEMS_KEY, id, 'content'];

export const MUTATION_KEYS = {
  POST_ITEM: 'postItem',
  EDIT_ITEM: 'editItem',
  DELETE_ITEM: 'deleteItem',
  DELETE_ITEMS: 'deleteItems',
  COPY_ITEM: 'copyItem',
  MOVE_ITEM: 'moveItem',
  SHARE_ITEM: 'shareItem',
  FILE_UPLOAD: 'fileUpload',
  SIGN_OUT: 'signOut',
  POST_ITEM_LOGIN: 'postItemLoginSignIn',
  buildItemMembershipsKey: (id: UUID) => [ITEMS_KEY, id, 'memberships'],
  DELETE_ITEM_TAG: 'deleteItemTag',
  POST_ITEM_TAG: 'postItemTags',
  PUT_ITEM_LOGIN: 'putItemLogin',
  EDIT_MEMBER: 'editMember',
  EDIT_ITEM_MEMBERSHIP: 'editItemMembership',
  DELETE_ITEM_MEMBERSHIP: 'deleteItemMembership',
};

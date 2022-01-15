import type { UUID } from '../types';
import { hashIds } from '../utils/item';

export const ITEMS_KEY = 'items';
export const OWN_ITEMS_KEY = [ITEMS_KEY, 'own'];
export const buildItemKey = (id?: UUID) => [ITEMS_KEY, id];
export const buildItemsKey = (ids: UUID[]) => [ITEMS_KEY, hashIds(ids)];
export const buildItemChildrenKey = (id?: UUID) => [ITEMS_KEY, id, 'children'];
export const SHARED_ITEMS_KEY = 'shared';
export const CURRENT_MEMBER_KEY = 'currentMember';
export const MEMBERS_KEY = 'members';

export const buildMemberKey = (id: UUID) => [MEMBERS_KEY, id];
export const buildItemParentsKey = (id: UUID) => [ITEMS_KEY, id, 'parents'];
export const CHATS_KEY = 'chats';
export const buildItemChatKey = (id: UUID) => [CHATS_KEY, id];


export const GROUPS_KEY = 'groups';
export const buildGroupKey = (id: UUID) => [GROUPS_KEY, id];
export const buildGroupsKey = (ids: UUID[]) => [ITEMS_KEY, hashIds(ids)];
export const buildGroupChildrenKey = (id: UUID) => [GROUPS_KEY, id, 'children'];
export const buildGroupItemsOwnKey = (id: UUID) => [GROUPS_KEY, id, 'own'];
export const buildGroupItemsSharedKey = (id: UUID) => [GROUPS_KEY, id, 'shared'];
export const buildGroupParentsKey = (id: UUID) => [GROUPS_KEY, id, 'parents'];

export const GROUP_MEMBERSHIPS_KEY = 'group-memberships';
export const OWN_GROUP_MEMBERSHIPS_KEY = [GROUP_MEMBERSHIPS_KEY, 'own'];
export const ROOT_GROUPS_KEY = [GROUPS_KEY, 'root'];
export const OWN_GROUPS_KEY = [GROUPS_KEY, 'own'];
export const buildGroupMembershipKey = (id?: UUID) => [GROUP_MEMBERSHIPS_KEY, id];

export const getKeyForParentId = (parentId: UUID | null) =>
  parentId ? buildItemChildrenKey(parentId) : OWN_ITEMS_KEY;

export const buildItemMembershipsKey = (id?: UUID) => [
  ITEMS_KEY,
  id,
  'memberships',
];
export const buildItemLoginKey = (id?: UUID) => [ITEMS_KEY, id, 'login'];
export const ITEM_TAGS = 'itemTags';
export const buildItemTagsKey = (id: UUID) => [ITEMS_KEY, id, 'tags'];
export const buildFileContentKey = (id?: UUID) => [ITEMS_KEY, id, 'content'];
export const buildS3FileContentKey = (id?: UUID) => [ITEMS_KEY, id, 'content'];

export const ITEM_FLAGS = 'itemFlags';
export const buildItemFlagsKey = (id: UUID) => [ITEMS_KEY, id, 'flags'];

export const MUTATION_KEYS = {
  POST_ITEM: 'postItem',
  POST_GROUP: 'postGroup',
  SHARE_GROUP: 'shareGroup',
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
  POST_ITEM_FLAG: 'postItemFlag',
  EDIT_ITEM_MEMBERSHIP: 'editItemMembership',
  DELETE_ITEM_MEMBERSHIP: 'deleteItemMembership',
  POST_ITEM_CHAT_MESSAGE: 'postChatMessage',
};

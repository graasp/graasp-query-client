export const KINDS = {
  CHILD: 'child',
  FEEDBACK: 'feedback',
  ITEM: 'item',
  RECYCLE_BIN: 'recycle_bin',
  SELF: 'self',
  ACCESSIBLE: 'accessible',
  SHARED: 'shared',
} as const;

export const OPS = {
  CLEAR: 'clear',
  COPY: 'copy',
  CREATE: 'create',
  DELETE: 'delete',
  EXPORT: 'export',
  MOVE: 'move',
  PUBLISH: 'publish',
  RESTORE: 'restore',
  UPDATE: 'update',
  VALIDATE: 'validate',
  RECYCLE: 'recycle',
} as const;

export const TOPICS = {
  CHAT_ITEM: 'chat/item',
  ITEM_MEMBER: 'item/member',
  ITEM: 'item',
  MEMBERSHIPS_ITEM: 'memberships/item',
  MENTIONS: 'mentions',
};

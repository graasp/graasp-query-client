/**
 * TODO: use types from graasp-websockets
 */

/** Namespace for notifications realm */
export const REALM_NOTIF = 'notif';

/** Client actions */
export const CLIENT_ACTION_SUBSCRIBE = 'subscribe';
export const CLIENT_ACTION_UNSUBSCRIBE = 'unsubscribe';
export const CLIENT_ACTION_SUBSCRIBE_ONLY = 'subscribeOnly';
export const CLIENT_ACTION_DISCONNECT = 'disconnect';

/** Server message types */
export const SERVER_TYPE_RESPONSE = 'response';
export const SERVER_TYPE_UPDATE = 'update';
export const SERVER_TYPE_INFO = 'info';

/** Server response status */
export const RESPONSE_STATUS_SUCCESS = 'success';
export const RESPONSE_STATUS_ERROR = 'error';

/** Error names */
export const ERROR_ACCESS_DENIED = 'ACCESS_DENIED';
export const ERROR_BAD_REQUEST = 'BAD_REQUEST';
export const ERROR_NOT_FOUND = 'NOT_FOUND';
export const ERROR_SERVER_ERROR = 'SERVER_ERROR';

export const KINDS = {
  ITEM: 'item',
  SELF: 'self',
  CHILD: 'child',
  OWN: 'own',
  SHARED: 'shared',
};

export const OPS = {
  PUBLISH: 'publish',
  UPDATE: 'update',
  DELETE: 'delete',
  CREATE: 'create',
};

export const TOPICS = {
  CHAT_ITEM: 'chat/item',
  ITEM: 'item',
  ITEM_MEMBER: 'item/member',
  MEMBERSHIPS_ITEM: 'memberships/item',
};

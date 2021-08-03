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

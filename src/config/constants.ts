export const ENV = {
  DEVELOPMENT: 'development',
};

export const UUID_LENGTH = 36;

export const ITEM_TYPES = {
  FOLDER: 'folder',
  FILE: 'file',
  S3_FILE: 's3File',
  LINK: 'embeddedLink',
  SHORTCUT: 'shortcut',
  DOCUMENT: 'document',
  APP: 'app',
};

export const DEFAULT_LOCALE = 'en-US';

export const PERMISSION_LEVELS = {
  WRITE: 'write',
  READ: 'read',
  ADMIN: 'admin',
};

export const DEFAULT_PERMISSION_LEVEL = PERMISSION_LEVELS.WRITE;

export const PERMISSIONS_EDITION_ALLOWED = [
  PERMISSION_LEVELS.WRITE,
  PERMISSION_LEVELS.ADMIN,
];

// React Query Configs
export const STALE_TIME_MILLISECONDS = 1000 * 60 * 60;
export const CACHE_TIME_MILLISECONDS = 1000 * 60 * 60;

export const SETTINGS = {
  ITEM_LOGIN: {
    name: 'item-login',
    OPTIONS: {
      USERNAME: 'username',
      USERNAME_AND_PASSWORD: 'username+password',
    },
    SIGN_IN_MODE: {
      USERNAME: 'username',
      MEMBER_ID: 'memberId',
    },
  },
};

export const SETTINGS_ITEM_LOGIN_DEFAULT = SETTINGS.ITEM_LOGIN.OPTIONS.USERNAME;
export const SETTINGS_ITEM_LOGIN_SIGN_IN_MODE_DEFAULT =
  SETTINGS.ITEM_LOGIN.SIGN_IN_MODE.USERNAME;

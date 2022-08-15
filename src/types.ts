export type Notifier = (e: unknown) => void;

export type QueryClientConfig = {
  API_HOST: string;
  SHOW_NOTIFICATIONS: boolean;
  WS_HOST: string;
  DOMAIN?: string;
  enableWebsocket: boolean;
  notifier?: Notifier;
  defaultQueryOptions: {
    // time until data in cache considered stale if cache not invalidated
    staleTime: number;
    // time before cache labeled as inactive to be garbage collected
    cacheTime: number;
    retry: number | boolean | ((failureCount: number, error: Error) => boolean);
    refetchOnWindowFocus?: boolean;
    keepPreviousData?: boolean;
    refetchOnMount?: boolean;
  };
};

// Graasp Core Types
// todo: use graasp-types

export type UUID = string;

export type ItemSettings = {
  hasThumbnail?: boolean;
};

export type Item = {
  id: UUID;
  name: string;
  path: string;
  type: string;
  description: string;
  extra: unknown;
  settings?: ItemSettings;
  createdAt: string;
  updatedAt: string;
};

export type MemberExtra = {
  hasAvatar?: boolean;
  password?: string;
};

export type Member = {
  id: UUID;
  name: string;
  email: string;
  extra: MemberExtra;
  createdAt: string;
  updatedAt: string;
};

export type Membership = {
  id: UUID;
  memberId: string;
  itemId: string;
  permission: string;
};

export type ExtendedItem = Item & {
  parentId: UUID;
};

export type Permission = string;

export type ItemTag = {
  id: UUID;
};

export type CategoryType = {
  id: UUID;
  name: string;
};

export type Category = {
  id: UUID;
  name: string;
  type: UUID;
};

export type ItemCategory = {
  id: UUID;
  itemId: UUID;
  categoryId: UUID;
};

export class UndefinedArgument extends Error {
  constructor() {
    super();
    this.message = 'UnexpectedInput';
    this.name = 'UnexpectedInput';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.stack = (<any>new Error()).stack;
  }
}

export enum ITEM_LOGIN_SCHEMAS {
  USERNAME = 'username',
  USERNAME_AND_PASSWORD = 'username+password',
}

export type ItemLogin = {
  loginSchema: ITEM_LOGIN_SCHEMAS;
};

// todo: use types from graasp types
export enum ITEM_TYPES {
  FOLDER = 'folder',
}

export enum PERMISSION_LEVELS {
  READ = 'read',
  WRITE = 'write',
  ADMIN = 'admin',
}

export type PartialNewChatMessage = {
  chatId: string;
  body: string;
};

export type PartialChatMessage = {
  chatId: string;
  messageId: string;
  body?: string;
};

export type ChatMessage = {
  id: string;
  chatId: string;
  creator: string;
  createdAt: string;
  body: string;
};

export interface Chat {
  id: string;
  messages: Array<ChatMessage>;
}

// todo: get from graasp types
export type GraaspError = {
  name: string;
  code: string;
  statusCode?: number;
  message: string;
  data?: unknown;
};

// a combined record from item-validation, item-validation-review, item-validation-process
export type FullValidationRecord = {
  id: string;
  itemId: string;
  reviewStatusId: string;
  validationStatusId: string;
  validationResult: string;
  process: string;
  createdAt: string;
};

export type ItemValidationAndReview = {
  itemValidationId: string;
  reviewStatusId: string;
  reviewReason: string;
  createdAt: string;
};

export type ItemValidationGroup = {
  id: string;
  itemId: string;
  itemValidationId: string;
  processId: string;
  statusId: string;
  result: string;
  updatedAt: string;
  createdAt: string;
};

export type Status = {
  id: string;
  name: string;
};

export interface Action {
  id: string;
  name: string;
}

export type Invitation = {
  id: UUID;
  email: string;
  permission: string;
  name?: string;
  createdAt: string;
};

export type Password = string;
export type NewInvitation = Pick<Invitation, 'email' & 'permission'> &
  Partial<Invitation>;

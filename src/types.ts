export type Notifier = (e: any) => void;

export type QueryClientConfig = {
  API_HOST: string;
  S3_FILES_HOST: string;
  SHOW_NOTIFICATIONS: boolean;
  WS_HOST: string;
  enableWebsocket: boolean;
  notifier?: Notifier;
  staleTime: number;
  cacheTime: number;
  retry: RetryValue<any>;
  refetchOnWindowFocus?: boolean;
  keepPreviousData?: boolean;
};

// Graasp Core Types
// todo: use graasp-types

export type UUID = string;

export type Item = {
  id: UUID;
  name: string;
  path: string;
  type: string;
  description: string;
  extra: {};
};

export type Member = {
  id: UUID;
  name: string;
  email: string;
  extra: {};
};

export type Membership = {
  id: UUID;
  memberId: string;
  itemId: string;
  permission: string;
};

export type GroupMembership = {
  id: UUID;
  member: UUID;
  group: UUID;
};

export type Group = Member & {
  type: string
}

export type ExtendedGroup = Member & {
  parentId: UUID;
}

export type ExtendedItem = Item & {
  parentId: UUID;
};

export type Permission = string;

export type ItemTag = {
  id: UUID;
};

export class UndefinedArgument extends Error {
  constructor() {
    super();
    this.message = 'UnexpectedInput';
    this.name = 'UnexpectedInput';
    this.stack = (<any>new Error()).stack;
  }
}

export type ItemLogin = {
  loginSchema: string;
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

export type PartialChatMessage = {
  chatId: string;
  body: string;
};

export type ChatMessage = {
  chatId: string;
  creator: string;
  createdAt: string;
  body: string;
};

export interface Chat {
  id: string;
  messages: Array<ChatMessage>;
}

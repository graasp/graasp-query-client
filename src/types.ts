import { RetryValue } from 'react-query/types/core/retryer';

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

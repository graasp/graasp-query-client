export type Notifier = (e: any) => void;

export type QueryClientConfig = {
  API_HOST: string;
  S3_FILES_HOST: string;
  SHOW_NOTIFICATIONS: boolean;
  notifier?: Notifier;
  staleTime: number;
  cacheTime: number;
  retry: RetryValue<any>;
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

export type ExtendedItem = Item & {
  parentId: UUID;
};

export type Permission = string;

export type ItemTag = {
  id: UUID;
};

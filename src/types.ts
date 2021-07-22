import { ChatMessage } from '@graasp/plugin-chatbox/src/interfaces/chat-message';
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

export function isItem(data: unknown): data is Item {
  const d = data as any;
  return (
    typeof d === 'object' &&
    d.id &&
    typeof d.id === 'string' &&
    d.name &&
    typeof d.name === 'string' &&
    d.path &&
    typeof d.path === 'string' &&
    d.type &&
    typeof d.type === 'string' &&
    d.description &&
    typeof d.description === 'string'
  );
}

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

export type PartialChatMessage = {
  chatId: string;
  body: string;
};

export function isChatMessage(data: unknown): data is ChatMessage {
  const d = data as any;
  return (
    typeof d === 'object' &&
    d.chatId &&
    typeof d.chatId === 'string' &&
    d.creator &&
    typeof d.creator === 'string' &&
    d.body &&
    typeof d.body === 'string'
  );
}

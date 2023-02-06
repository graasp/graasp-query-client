import { List, RecordOf } from 'immutable';

import {
  AppItemType,
  DocumentItemType,
  EmbeddedLinkItemType,
  Etherpad,
  EtherpadItemType,
  FolderItemType,
  H5PItemType,
  ItemMembership,
  ItemSettings,
  LocalFileItemType,
  Member,
  MemberExtra,
  MentionStatus,
  PermissionLevel,
  S3FileItemType,
  ShortcutItemType,
  UnknownExtra,
} from '@graasp/sdk';

import { ImmutableCast, isDataEqual } from './utils/util';

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
    retry?:
      | number
      | boolean
      | ((failureCount: number, error: Error) => boolean);
    refetchOnWindowFocus?: boolean;
    keepPreviousData?: boolean;
    refetchOnMount?: boolean;
    notifyOnChangeProps?: any;
    isDataEqual?: typeof isDataEqual;
  };
};

export type UUID = string;

export type ItemSettingsRecord = RecordOf<ItemSettings>;

export type ItemExtraRecord = RecordOf<UnknownExtra>;

export type ItemRecord =
  | RecordOf<AppItemType>
  | RecordOf<DocumentItemType>
  | RecordOf<FolderItemType>
  | RecordOf<H5PItemType>
  | RecordOf<EmbeddedLinkItemType>
  | RecordOf<LocalFileItemType>
  | RecordOf<S3FileItemType>
  | RecordOf<ShortcutItemType>
  | RecordOf<EtherpadItemType>;

export type EtherpadRecord = RecordOf<Etherpad>;

export type MemberExtraRecord = ImmutableCast<MemberExtra>;

export type MemberRecord = ImmutableCast<Member<MemberExtraRecord>>;

export type ItemMembershipRecord = RecordOf<ItemMembership>;

export type ItemTag = {
  id: UUID;
  itemPath: string;
  tagId: UUID;
  createdAt: string;
  creator: string;
};

export type ItemTagRecord = RecordOf<ItemTag>;

export type CategoryType = {
  id: UUID;
  name: string;
};

export type CategoryTypeRecord = RecordOf<CategoryType>;

export type Category = {
  id: UUID;
  name: string;
  type: UUID;
};

export type CategoryRecord = RecordOf<Category>;

export type ItemCategory = {
  id: UUID;
  itemId: UUID;
  categoryId: UUID;
  createdAt: string;
  creator: string;
};

export type ItemCategoryRecord = RecordOf<ItemCategory>;

export enum ITEM_LOGIN_SCHEMAS {
  USERNAME = 'username',
  USERNAME_AND_PASSWORD = 'username+password',
}

export type ItemLogin = {
  loginSchema: ITEM_LOGIN_SCHEMAS;
};

export type ItemLoginRecord = RecordOf<ItemLogin>;

export type ChatMention = {
  id: string;
  itemPath: string;
  message: string;
  messageId: string;
  memberId: string;
  creator: string;
  createdAt: string;
  updatedAt: string;
  status: MentionStatus;
};

export type ChatMentionRecord = RecordOf<ChatMention>;

export type PartialChatMention = {
  id: string;
  status: MentionStatus;
};

export type MemberMentions = {
  memberId: string;
  mentions: List<ChatMentionRecord>;
};

export type MemberMentionsRecord = RecordOf<MemberMentions>;

export type MessageBodyType = { message: string; mentions?: string[] };

export type PartialNewChatMessage = {
  chatId: string;
  body: MessageBodyType;
};

export type PartialChatMessage = {
  chatId: string;
  messageId: string;
  body?: MessageBodyType;
};

export type ChatMessage = {
  id: string;
  chatId: string;
  creator: string;
  createdAt: string;
  updatedAt: string;
  body: string;
};

export type ChatMessageRecord = RecordOf<ChatMessage>;

export type ItemChat = {
  id: string;
  messages: List<ChatMessageRecord>;
};

export type ItemChatRecord = RecordOf<ItemChat>;

// type of the exported chat message
// contains the additional "creatorName" key with the plain text name of the user
export type ExportedChatMessage = {
  id: string;
  chatId: string;
  creator: string;
  creatorName: string;
  createdAt: string;
  updatedAt: string;
  body: string;
};

export type ExportedChatMessageRecord = RecordOf<ExportedChatMessage>;

export type ExportedItemChat = {
  id: string;
  messages: List<ExportedChatMessageRecord>;
};

export type ExportedItemChatRecord = RecordOf<ExportedItemChat>;

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

export type FullValidationRecordRecord = RecordOf<FullValidationRecord>;

export type ItemValidationAndReview = {
  itemValidationId: string;
  reviewStatusId: string;
  reviewReason: string;
  createdAt: string;
};

export type ItemValidationAndReviewRecord = RecordOf<ItemValidationAndReview>;

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

export type ItemValidationGroupRecord = RecordOf<ItemValidationGroup>;

export type Status = {
  id: string;
  name: string;
};

export type StatusRecord = RecordOf<Status>;

export interface Action {
  id: string;
  itemId: UUID;
  memberId: UUID;
}

export type ActionRecord = RecordOf<Action>;
export type ActionMetadata = {
  numActionsRetrieved: number;
  requestedSampleSize: number;
};
export type ActionMetadataRecord = RecordOf<{
  numActionsRetrieved: number;
  requestedSampleSize: number;
}>;

export interface ActionData {
  actions: List<ActionRecord>;
  descendants: List<ItemRecord>;
  item: ItemRecord;
  itemMemberships: List<ItemMembershipRecord>;
  members: List<MemberRecord>;
  metadata: ActionMetadataRecord;
}

export type ActionDataRecord = RecordOf<ActionData>;

export type Invitation = {
  id: UUID;
  email: string;
  permission?: PermissionLevel;
  name?: string;
  creator: UUID;
  itemPath: string;
};

export type InvitationRecord = RecordOf<Invitation>;

export type Password = string;
export type NewInvitation = Pick<Invitation, 'email' & 'permission'> &
  Partial<Invitation>;

export type Flag = {
  id: UUID;
  name: string;
};

export type FlagRecord = RecordOf<Flag>;

export type ItemLike = {
  id: UUID;
  itemId: UUID;
  memberId: string;
  createdAt: string;
};

export type ItemLikeRecord = RecordOf<ItemLike>;

export type App = {
  name: string;
  url: string;
  description: string;
  extra: any;
};

export type AppRecord = RecordOf<App>;

export type Tag = {
  id: UUID;
  name: string;
};

export type TagRecord = RecordOf<Tag>;

export type MessageItemChat = {
  id: UUID;
  creator: UUID;
  content: string;
};

export type MessageItemChatRecord = RecordOf<MessageItemChat>;

export type MessageItemChatList = {
  messages: List<MessageItemChatRecord>;
};

export type MessageItemChatListRecord = RecordOf<MessageItemChatList>;

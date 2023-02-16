import { List, RecordOf } from 'immutable';

import { PermissionLevel } from '@graasp/sdk';
import {
  ItemMembershipRecord,
  ItemRecord,
  MemberRecord,
} from '@graasp/sdk/frontend';

import { isDataEqual } from './utils/util';

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

/**
 * @deprecated use graasp sdk instead
 */
type UUID = string;
/**
 * @deprecated use graasp sdk instead
 */
export type ItemTag = {
  id: UUID;
  itemPath: string;
  tagId: UUID;
  createdAt: string;
  creator: string;
};
/**
 * @deprecated use graasp sdk instead
 */
export type ItemTagRecord = RecordOf<ItemTag>;

/**
 * @deprecated use @graasp/sdk/frontend instead
 */
export type CategoryType = {
  id: UUID;
  name: string;
};

/**
 * @deprecated use @graasp/sdk/frontend instead
 */
export type CategoryTypeRecord = RecordOf<CategoryType>;

/**
 * @deprecated use @graasp/sdk/frontend instead
 */
export type Category = {
  id: UUID;
  name: string;
  type: UUID;
};

/**
 * @deprecated use @graasp/sdk/frontend instead
 */
export type CategoryRecord = RecordOf<Category>;

/**
 * @deprecated use @graasp
 */
export type ItemCategory = {
  id: UUID;
  itemId: UUID;
  categoryId: UUID;
  createdAt: string;
  creator: string;
};

/**
 * @deprecated use @graasp/sdk/frontend instead
 */
export type ItemCategoryRecord = RecordOf<ItemCategory>;

/**
 * @deprecated use @graasp/sdk/frontend instead
 */
export enum ITEM_LOGIN_SCHEMAS {
  USERNAME = 'username',
  USERNAME_AND_PASSWORD = 'username+password',
}

/**
 * @deprecated use graasp sdk instead
 */
export type ItemLogin = {
  loginSchema: ITEM_LOGIN_SCHEMAS;
};

/**
 * @deprecated use graasp sdk instead
 */
export type ItemLoginRecord = RecordOf<ItemLogin>;

/**
 * @deprecated use graasp sdk instead
 */
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

/**
 * @deprecated use graasp sdk instead
 */
export type ExportedChatMessageRecord = RecordOf<ExportedChatMessage>;

/**
 * @deprecated use graasp sdk instead
 */
export type ExportedItemChat = {
  id: string;
  messages: List<ExportedChatMessageRecord>;
};

/**
 * @deprecated use graasp sdk instead
 */
export type ExportedItemChatRecord = RecordOf<ExportedItemChat>;

/**
 * @deprecated use graasp sdk instead
 */
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

/**
 * @deprecated use graasp sdk instead
 */
export type FullValidationRecordRecord = RecordOf<FullValidationRecord>;

/**
 * @deprecated use graasp sdk instead
 */
export type ItemValidationAndReview = {
  itemValidationId: string;
  reviewStatusId: string;
  reviewReason: string;
  createdAt: string;
};

/**
 * @deprecated use graasp sdk instead
 */
export type ItemValidationAndReviewRecord = RecordOf<ItemValidationAndReview>;

/**
 * @deprecated use graasp sdk instead
 */
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

/**
 * @deprecated use graasp sdk instead
 */
export type ItemValidationGroupRecord = RecordOf<ItemValidationGroup>;

/**
 * @deprecated use graasp sdk instead
 */
export type Status = {
  id: string;
  name: string;
};

/**
 * @deprecated use graasp sdk instead
 */
export type StatusRecord = RecordOf<Status>;

/**
 * @deprecated use graasp sdk instead
 */
export interface Action {
  id: string;
  itemId: UUID;
  memberId: UUID;
}

/**
 * @deprecated use graasp sdk instead
 */
export type ActionRecord = RecordOf<Action>;
/**
 * @deprecated use graasp sdk instead
 */
export type ActionMetadata = {
  numActionsRetrieved: number;
  requestedSampleSize: number;
};
/**
 * @deprecated use graasp sdk instead
 */
export type ActionMetadataRecord = RecordOf<{
  numActionsRetrieved: number;
  requestedSampleSize: number;
}>;

/**
 * @deprecated use graasp sdk instead
 */
export interface ActionData {
  actions: List<ActionRecord>;
  descendants: List<ItemRecord>;
  item: ItemRecord;
  itemMemberships: List<ItemMembershipRecord>;
  members: List<MemberRecord>;
  metadata: ActionMetadataRecord;
}

/**
 * @deprecated use graasp sdk instead
 */
export type ActionDataRecord = RecordOf<ActionData>;
/**
 * @deprecated use graasp sdk instead
 */
export type Invitation = {
  id: UUID;
  email: string;
  permission?: PermissionLevel;
  name?: string;
  creator: UUID;
  itemPath: string;
};
/**
 * @deprecated use graasp sdk instead
 */
export type InvitationRecord = RecordOf<Invitation>;

/**
 * @deprecated use graasp sdk instead
 */
export type Password = string;
/**
 * @deprecated use graasp sdk instead
 */
export type NewInvitation = Pick<Invitation, 'email' & 'permission'> &
  Partial<Invitation>;

/**
 * @deprecated use @graasp/sdk/frontend instead
 */
export type Flag = {
  id: UUID;
  name: string;
};
/**
 * @deprecated use @graasp/sdk/frontend instead
 */
export type FlagRecord = RecordOf<Flag>;

/**
 * @deprecated use graasp sdk instead
 */
export type ItemLike = {
  id: UUID;
  itemId: UUID;
  memberId: string;
  createdAt: string;
};

/**
 * @deprecated use graasp sdk instead
 */
export type ItemLikeRecord = RecordOf<ItemLike>;

/**
 * @deprecated use graasp sdk instead
 */
export type App = {
  name: string;
  url: string;
  description: string;
  extra: any;
};

/**
 * @deprecated use graasp sdk instead
 */
export type AppRecord = RecordOf<App>;

/**
 * @deprecated use graasp sdk instead
 */
export type Tag = {
  id: UUID;
  name: string;
};

/**
 * @deprecated use graasp sdk instead
 */
export type TagRecord = RecordOf<Tag>;

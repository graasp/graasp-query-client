import { StatusCodes } from 'http-status-codes';
import { List, Record } from 'immutable';
import { v4 } from 'uuid';

import {
  HttpMethod,
  Item,
  ItemMembership,
  ItemSettings,
  ItemType,
  MAX_TARGETS_FOR_MODIFY_REQUEST,
  MAX_TARGETS_FOR_READ_REQUEST,
  Member,
  MemberExtra,
  MemberType,
  MentionStatus,
  PermissionLevel,
  UnknownExtra,
} from '@graasp/sdk';

import {
  Action,
  ActionData,
  ActionDataRecord,
  ActionMetadata,
  ActionMetadataRecord,
  ActionRecord,
  App,
  AppRecord,
  Category,
  CategoryRecord,
  CategoryType,
  CategoryTypeRecord,
  ChatMention,
  ChatMentionRecord,
  ChatMessage,
  ChatMessageRecord,
  Flag,
  FlagRecord,
  FullValidationRecord,
  FullValidationRecordRecord,
  ITEM_LOGIN_SCHEMAS,
  Invitation,
  InvitationRecord,
  ItemCategory,
  ItemCategoryRecord,
  ItemExtraRecord,
  ItemLike,
  ItemLikeRecord,
  ItemLogin,
  ItemLoginRecord,
  ItemMembershipRecord,
  ItemRecord,
  ItemSettingsRecord,
  ItemTag,
  ItemTagRecord,
  ItemValidationAndReview,
  ItemValidationAndReviewRecord,
  ItemValidationGroup,
  ItemValidationGroupRecord,
  MemberExtraRecord,
  MemberMentions,
  MemberMentionsRecord,
  MemberRecord,
  MessageItemChat,
  MessageItemChatList,
  MessageItemChatListRecord,
  MessageItemChatRecord,
  Status,
  StatusRecord,
  TagRecord,
  Tag as TagType,
  UUID,
  ExportedChatMessage,
  ExportedChatMessageRecord,
} from '../src/types';

export const WS_HOST = 'ws://localhost:3000';
export const API_HOST = 'http://localhost:3000';
export const DOMAIN = 'domain';
export const UNAUTHORIZED_RESPONSE = {
  name: 'unauthorized',
  code: 'ERRCODE',
  message: 'unauthorized error message',
  statusCode: StatusCodes.UNAUTHORIZED,
  origin: 'plugin',
};

const createItemExtra: Record.Factory<UnknownExtra> = Record({});
const createItemSettings: Record.Factory<ItemSettings> = Record({});

const createMockItem: Record.Factory<
  Item<ItemExtraRecord, ItemSettingsRecord>
> = Record({
  id: '42',
  name: 'item1',
  path: '42',
  // clearly type enum for immutable record to correctly infer
  type: ItemType.FOLDER as ItemType,
  description: '',
  extra: createItemExtra({}),
  creator: 'creator',
  updatedAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  settings: createItemSettings({}),
});

const ITEM_1: ItemRecord = createMockItem({
  id: '42',
  name: 'item1',
  path: '42',
});

const ITEM_2: ItemRecord = createMockItem({
  id: '5243',
  name: 'item2',
  path: '5243',
});

const ITEM_3: ItemRecord = createMockItem({
  id: '5896',
  name: 'item3',
  path: '5896',
});

const ITEM_4: ItemRecord = createMockItem({
  id: 'dddd',
  name: 'item4',
  path: '5896.dddd',
});

const ITEM_5: ItemRecord = createMockItem({
  id: 'eeee',
  name: 'item5',
  path: '5896.eeee',
});

const ITEM_6: ItemRecord = createMockItem({
  id: 'gggg',
  name: 'item5',
  path: '5896.gggg',
});

export const ITEMS: List<ItemRecord> = List([
  ITEM_1,
  ITEM_2,
  ITEM_3,
  ITEM_4,
  ITEM_5,
  ITEM_6,
  ...Array.from(
    {
      length:
        Math.max(MAX_TARGETS_FOR_MODIFY_REQUEST, MAX_TARGETS_FOR_READ_REQUEST) +
        1,
    },
    (_, idx) =>
      createMockItem({
        id: `item-${idx}`,
        name: `item-${idx}`,
        path: `item_${idx}`,
        type: ItemType.FOLDER,
        description: '',
      }),
  ),
]);

export const MESSAGE_IDS = ['12345', '78945'];

const defaultMemberExtraValues: MemberExtra = {};
const createMemberExtra: Record.Factory<MemberExtra> = Record(
  defaultMemberExtraValues,
);

const createMockMember: Record.Factory<Member<MemberExtraRecord>> = Record({
  id: '42',
  name: 'username',
  email: 'username@graasp.org',
  type: MemberType.Individual as MemberType,
  extra: createMemberExtra({}),
  updatedAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
});

export const MEMBER_RESPONSE: MemberRecord = createMockMember();

export const MENTION_IDS = ['12345', '78945'];

const recycleBinItemId = 'recycleBinId';
export const GET_RECYCLED_ITEMS_FIXTURES = {
  items: [
    {
      id: `${recycleBinItemId}.42`,
      name: 'item1',
      path: '42',
      type: ItemType.FOLDER,
      description: '',
      extra: {},
    },
    {
      id: `${recycleBinItemId}.5243`,
      name: 'item2',
      path: '5243',
      type: ItemType.FOLDER,
      description: '',
      extra: {},
    },
    {
      id: `${recycleBinItemId}.5896`,
      name: 'item3',
      path: '5896',
      type: ItemType.FOLDER,
      description: '',
      extra: {},
    },
    {
      id: `${recycleBinItemId}.dddd`,
      name: 'item4',
      path: '5896.dddd',
      type: ItemType.FOLDER,
      description: '',
      extra: {},
    },
  ],
  member: {
    ...MEMBER_RESPONSE,
    extra: {
      recycleBin: {
        itemId: recycleBinItemId,
      },
    },
  },
};

const MEMBER_RESPONSE_2: MemberRecord = createMockMember({
  id: '421',
  name: 'username1',
  email: 'username1@graasp.org',
});

export const MEMBERS_RESPONSE: List<MemberRecord> = List([
  MEMBER_RESPONSE,
  MEMBER_RESPONSE_2,
  ...Array.from({ length: MAX_TARGETS_FOR_READ_REQUEST }, (_, idx) =>
    createMockMember({
      id: idx.toString(),
      name: `username-${idx}`,
      email: `username-${idx}@graasp.org`,
    }),
  ),
]);

export const OK_RESPONSE = {};

const createMockMembership: Record.Factory<ItemMembership> = Record({
  id: 'membership-id',
  memberId: 'member-id',
  itemPath: ITEMS.first()!.path,
  // clearly type enum for immutable record to correctly infer
  permission: PermissionLevel.Read as PermissionLevel,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  creator: 'creator-id',
});

const MEMBERSHIP_1: ItemMembershipRecord = createMockMembership({
  id: 'membership-id',
  memberId: 'member-id',
  itemPath: ITEMS.first()!.path,
  permission: PermissionLevel.Read,
});

const MEMBERSHIP_2: ItemMembershipRecord = createMockMembership({
  id: 'membership-id1',
  memberId: 'member-id1',
  itemPath: ITEMS.first()!.path,
  permission: PermissionLevel.Admin,
});

export const ITEM_MEMBERSHIPS_RESPONSE: List<ItemMembershipRecord> = List([
  MEMBERSHIP_1,
  MEMBERSHIP_2,
]);

const defaultItemLoginResponseValues: ItemLogin = {
  loginSchema: ITEM_LOGIN_SCHEMAS.USERNAME,
};
const createMockItemLoginResponse: Record.Factory<ItemLogin> = Record(
  defaultItemLoginResponseValues,
);

export const ITEM_LOGIN_RESPONSE: ItemLoginRecord =
  createMockItemLoginResponse();

const BlobMock = {
  blob: () => 'blob',
};

export const FILE_RESPONSE = 'somedata';

export const S3_FILE_RESPONSE = {
  key: 'someurl',
};
export const S3_FILE_BLOB_RESPONSE = BlobMock;
export const THUMBNAIL_BLOB_RESPONSE = BlobMock;
export const AVATAR_BLOB_RESPONSE = BlobMock;

export const buildMentionResponse = (
  mention: ChatMention,
  method: HttpMethod,
  status?: MentionStatus,
): ChatMention => {
  switch (method) {
    case HttpMethod.PATCH:
      return {
        ...mention,
        status: status || mention.status,
      };
    case HttpMethod.DELETE:
      return mention;
    default:
      return mention;
  }
};

const defaultAppExtraValues: any = { image: 'http://codeapp.com/logo.png' };
const createAppExtra: Record.Factory<any> = Record(defaultAppExtraValues);

const defaultAppValues: App = {
  name: 'Code App',
  url: 'http://codeapp.com',
  description: 'description',
  extra: createAppExtra({ image: 'http://codeapp.com/logo.png' }),
};
const createMockApps: Record.Factory<App> = Record(defaultAppValues);

const APP_1: AppRecord = createMockApps({
  name: 'Code App',
  url: 'http://codeapp.com',
  description: 'description',
  extra: createAppExtra({ image: 'http://codeapp.com/logo.png' }),
});

const APP_2: AppRecord = createMockApps({
  name: 'File App',
  description: 'description',
  url: 'http://fileapp.com',
  extra: createAppExtra({ image: 'http://fileapp.com/logo.png' }),
});

export const APPS: List<AppRecord> = List([APP_1, APP_2]);

export const buildChatMessages = (id: UUID) => {
  const defaultChatMessageValues: ChatMessage = {
    id: '',
    chatId: id,
    body: 'some text',
    creator: 'somememberid',
    createdAt: 'someDate',
    updatedAt: 'someDate',
  };
  const createMockChatMessage: Record.Factory<ChatMessage> = Record(
    defaultChatMessageValues,
  );
  const CHAT_MESSAGE_1: ChatMessageRecord = createMockChatMessage({
    id: v4(),
    chatId: id,
    body: 'some text',
    creator: 'somememberid',
  });
  const CHAT_MESSAGE_2: ChatMessageRecord = createMockChatMessage({
    id: v4(),
    chatId: id,
    body: 'some other text',
    creator: 'someothermemberid',
  });
  const CHAT_MESSAGES: List<ChatMessageRecord> = List([
    CHAT_MESSAGE_1,
    CHAT_MESSAGE_2,
  ]);
  return CHAT_MESSAGES;
};

export const buildExportedChat = (id: UUID) => {
  const defaultExportedChatMessageValues: ExportedChatMessage = {
    id: '',
    chatId: id,
    body: 'some text',
    creator: 'somememberid',
    creatorName: 'Some Name',
    createdAt: 'someDate',
    updatedAt: 'someDate',
  };
  const createMockExportedChatMessage: Record.Factory<ExportedChatMessage> =
    Record(defaultExportedChatMessageValues);
  const CHAT_MESSAGE_1: ExportedChatMessageRecord =
    createMockExportedChatMessage({
      id: v4(),
      chatId: id,
      body: 'some text',
      creator: 'somememberid',
    });
  const CHAT_MESSAGE_2: ExportedChatMessageRecord =
    createMockExportedChatMessage({
      id: v4(),
      chatId: id,
      body: 'some other text',
      creator: 'someothermemberid',
      creatorName: 'Some other name',
    });
  const CHAT_MESSAGES: List<ExportedChatMessageRecord> = List([
    CHAT_MESSAGE_1,
    CHAT_MESSAGE_2,
  ]);
  return CHAT_MESSAGES;
};

export const buildChatMention = ({
  id = v4(),
  memberId,
  status = MentionStatus.UNREAD,
}: {
  id?: UUID;
  memberId: UUID;
  status?: MentionStatus;
}) => {
  const defaultChatMentionValues: ChatMention = {
    id: 'someid',
    itemPath: 'somepath',
    message: 'somemessage here',
    messageId: 'anotherid',
    createdAt: 'somedate',
    updatedAt: 'somedate',
    memberId: 'amemberid',
    status: MentionStatus.UNREAD,
    creator: 'somememberid',
  };
  const createMockChatMention: Record.Factory<ChatMention> = Record(
    defaultChatMentionValues,
  );

  const CHAT_MENTION: ChatMentionRecord = createMockChatMention({
    id,
    memberId,
    status,
  });
  return CHAT_MENTION;
};

export const buildMemberMentions = (memberId: string) => {
  const CHAT_MENTION_1: ChatMentionRecord = buildChatMention({ memberId });
  const CHAT_MENTION_2: ChatMentionRecord = buildChatMention({ memberId });
  const defaultMemberMentionsValues: MemberMentions = {
    memberId: '',
    mentions: List([]),
  };

  const createMockMemberMentions: Record.Factory<MemberMentions> = Record(
    defaultMemberMentionsValues,
  );
  const MEMBER_MENTIONS: MemberMentionsRecord = createMockMemberMentions({
    memberId,
    mentions: List([CHAT_MENTION_1, CHAT_MENTION_2]),
  });
  return MEMBER_MENTIONS;
};

const defaultFlagsValues: Flag = {
  id: 'flag-1-id',
  name: 'flag-1',
};
const createMockFlags: Record.Factory<Flag> = Record(defaultFlagsValues);

const FLAG_1: FlagRecord = createMockFlags({
  id: 'flag-1-id',
  name: 'flag-1',
});

const FLAG_2: FlagRecord = createMockFlags({
  id: 'flag-2-id',
  name: 'flag-2',
});

export const FLAGS: List<FlagRecord> = List([FLAG_1, FLAG_2]);

const defaultTagsValues: TagType = {
  id: 'item-login-tag-id',
  name: 'item-login',
};
const createMockTags: Record.Factory<TagType> = Record(defaultTagsValues);

const TAG_1: TagRecord = createMockTags({
  id: 'item-login-tag-id',
  name: 'item-login',
});

const TAG_2: TagRecord = createMockTags({
  id: 'item-public-tag-id',
  name: 'item-public',
});

export const TAGS: List<TagRecord> = List([TAG_1, TAG_2]);

const defaultItemTagsValues: ItemTag = {
  id: 'tag-id',
  itemPath: 'somepath',
  tagId: 'tag-id',
  createdAt: 'createdAt',
  creator: 'creator-id',
};
const createMockItemTags: Record.Factory<ItemTag> = Record(
  defaultItemTagsValues,
);

const ITEM_TAG_1: ItemTagRecord = createMockItemTags({
  id: 'tag-id',
  itemPath: 'somepath',
  tagId: 'tag-id',
});

const ITEM_TAG_2: ItemTagRecord = createMockItemTags({
  id: 'tag-id1',
  itemPath: 'somepath1',
  tagId: 'tag-id1',
});

export const ITEM_TAGS: List<ItemTagRecord> = List([ITEM_TAG_1, ITEM_TAG_2]);

const defaultMessageItemChatValues: MessageItemChat = {
  id: MESSAGE_IDS[0],
  creator: MEMBER_RESPONSE.id,
  content: 'text',
};
const createMockMessageItemChat: Record.Factory<MessageItemChat> = Record(
  defaultMessageItemChatValues,
);

const MESSAGE_ITEM_CHAT_1: MessageItemChatRecord = createMockMessageItemChat({
  id: MESSAGE_IDS[0],
  creator: MEMBER_RESPONSE.id,
  content: 'text',
});

export const MESSAGE_ITEM_CHAT_LIST: List<MessageItemChatRecord> = List([
  MESSAGE_ITEM_CHAT_1,
]);

const defaultItemChatValues: MessageItemChatList = {
  messages: MESSAGE_ITEM_CHAT_LIST,
};

const createMockItemChat: Record.Factory<MessageItemChatList> = Record(
  defaultItemChatValues,
);

export const ITEM_CHAT: MessageItemChatListRecord = createMockItemChat({
  messages: MESSAGE_ITEM_CHAT_LIST,
});

const defaultCategoryTypeValues: CategoryType = {
  id: 'type-id',
  name: 'type-name',
};
const createMockCategoryType: Record.Factory<CategoryType> = Record(
  defaultCategoryTypeValues,
);

const CATEGORY_TYPE_1: CategoryTypeRecord = createMockCategoryType({
  id: 'type-id',
  name: 'type-name',
});

export const CATEGORY_TYPES: List<CategoryTypeRecord> = List([CATEGORY_TYPE_1]);

const defaultCategoryValues: Category = {
  id: 'category-id1',
  name: 'category-name1',
  type: 'type-id1',
};
const createMockCategory: Record.Factory<Category> = Record(
  defaultCategoryValues,
);

const CATEGORY_1: CategoryRecord = createMockCategory({
  id: 'category-id1',
  name: 'category-name1',
  type: 'type-id1',
});

const CATEGORY_2: CategoryRecord = createMockCategory({
  id: 'category-id2',
  name: 'category-name2',
  type: 'type-id2',
});

export const CATEGORIES: List<CategoryRecord> = List([CATEGORY_1, CATEGORY_2]);

const defaultItemCategoryValues: ItemCategory = {
  id: 'id1',
  itemId: 'item-id',
  categoryId: 'category-id1',
  createdAt: 'somedate',
  creator: 'creator-id',
};
const createMockItemCategory: Record.Factory<ItemCategory> = Record(
  defaultItemCategoryValues,
);

const ITEM_CATEGORY_1: ItemCategoryRecord = createMockItemCategory({
  id: 'id1',
  itemId: 'item-id',
  categoryId: 'category-id1',
});

const ITEM_CATEGORY_2: ItemCategoryRecord = createMockItemCategory({
  id: 'id2',
  itemId: 'item-id',
  categoryId: 'category-id2',
});

export const ITEM_CATEGORIES: List<ItemCategoryRecord> = List([
  ITEM_CATEGORY_1,
  ITEM_CATEGORY_2,
]);

export enum Ranges {
  All = 'all',
  Tag = 'tag',
  Title = 'title',
  Author = 'author',
}

const createMockItemLike: Record.Factory<ItemLike> = Record({
  id: 'id1',
  itemId: 'item-id',
  memberId: 'member-id',
  createdAt: new Date().toISOString(),
});

const ITEM_LIKE_1: ItemLikeRecord = createMockItemLike({
  id: 'id1',
  itemId: 'item-id',
  memberId: 'member-id',
});

const ITEM_LIKE_2: ItemLikeRecord = createMockItemLike({
  id: 'id2',
  itemId: 'item-id2',
  memberId: 'member-id',
});

export const ITEM_LIKES: List<ItemLikeRecord> = List([
  ITEM_LIKE_1,
  ITEM_LIKE_2,
]);

export const LIKE_COUNT = 100;

const createMockStatus: Record.Factory<Status> = Record({
  id: 'id',
  name: 'status-1',
});

const STATUS_1: StatusRecord = createMockStatus({
  id: 'id',
  name: 'status-1',
});

const STATUS_2: StatusRecord = createMockStatus({
  id: 'id-2',
  name: 'status-2',
});

export const STATUS_LIST: List<StatusRecord> = List([STATUS_1, STATUS_2]);

const createMockItemValidationSatus: Record.Factory<ItemValidationAndReview> =
  Record({
    itemValidationId: 'iv-id-1',
    reviewStatusId: 'accepted',
    reviewReason: '',
    createdAt: new Date().toISOString(),
  });

export const ITEM_VALIDATION_STATUS: ItemValidationAndReviewRecord =
  createMockItemValidationSatus({
    itemValidationId: 'iv-id-1',
    reviewStatusId: 'accepted',
    reviewReason: '',
  });

const createMockFullValidation: Record.Factory<FullValidationRecord> = Record({
  id: 'id-1',
  itemId: 'item-id-1',
  reviewStatusId: 'status-id-1',
  validationStatusId: 'status-id-2',
  validationResult: '',
  process: 'process-1',
  createdAt: new Date().toISOString(),
});

const FULL_VALIDATION_RECORDS_1: FullValidationRecordRecord =
  createMockFullValidation({
    id: 'id-1',
    itemId: 'item-id-1',
    reviewStatusId: 'status-id-1',
    validationStatusId: 'status-id-2',
    validationResult: '',
    process: 'process-1',
  });

const FULL_VALIDATION_RECORDS_2: FullValidationRecordRecord =
  createMockFullValidation({
    id: 'id-2',
    itemId: 'item-id-1',
    reviewStatusId: 'status-id-1',
    validationStatusId: 'status-id-2',
    validationResult: '',
    process: 'process-2',
  });

export const FULL_VALIDATION_RECORDS: List<FullValidationRecordRecord> = List([
  FULL_VALIDATION_RECORDS_1,
  FULL_VALIDATION_RECORDS_2,
]);

const createMockItemValidationGroup: Record.Factory<ItemValidationGroup> =
  Record({
    id: 'id-1',
    itemId: 'item-id-1',
    itemValidationId: 'iv-id',
    processId: 'ivp-id-1',
    statusId: 'success-id',
    result: '',
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  });

const ITEM_VALIDATION_GROUP_1: ItemValidationGroupRecord =
  createMockItemValidationGroup({
    id: 'id-1',
    itemId: 'item-id-1',
    itemValidationId: 'iv-id',
    processId: 'ivp-id-1',
    statusId: 'success-id',
    result: '',
  });

const ITEM_VALIDATION_GROUP_2: ItemValidationGroupRecord =
  createMockItemValidationGroup({
    id: 'id-2',
    itemId: 'item-id-1',
    itemValidationId: 'iv-id',
    processId: 'ivp-id-2',
    statusId: 'success-id',
    result: '',
  });

export const ITEM_VALIDATION_GROUPS: List<ItemValidationGroupRecord> = List([
  ITEM_VALIDATION_GROUP_1,
  ITEM_VALIDATION_GROUP_2,
]);

const createMockAction: Record.Factory<Action> = Record({
  id: 'action-id',
  itemId: 'item-id',
  memberId: 'member-id',
});

const ACTION_1: ActionRecord = createMockAction({
  id: 'action-id',
  itemId: 'item-id',
  memberId: 'member-id',
});

export const ACTIONS_LIST: List<ActionRecord> = List([ACTION_1]);

const createMockActionMetadata: Record.Factory<ActionMetadata> = Record({
  numActionsRetrieved: ACTIONS_LIST.size,
  requestedSampleSize: ACTIONS_LIST.size,
});

const ACTION_METADATA: ActionMetadataRecord = createMockActionMetadata({
  numActionsRetrieved: ACTIONS_LIST.size,
  requestedSampleSize: ACTIONS_LIST.size,
});

const createMockActionData: Record.Factory<ActionData> = Record({
  actions: ACTIONS_LIST,
  members: List([MEMBER_RESPONSE]),
  descendants: List(),
  item: ITEM_1,
  itemMemberships: List([MEMBERSHIP_1]),
  metadata: ACTION_METADATA,
});

export const ACTIONS_DATA: ActionDataRecord = createMockActionData({
  actions: ACTIONS_LIST,
});

export const buildInvitation = ({
  itemPath,
  email,
  name,
}: {
  itemPath: UUID;
  email?: string;
  name?: string;
}) => ({
  id: 'id',
  name: name ?? 'member-name',
  email: email ?? 'email',
  creator: 'creator-id',
  itemPath,
});

export const buildInvitationRecord = ({
  itemPath,
  email,
  name,
}: {
  itemPath: UUID;
  email?: string;
  name?: string;
}) => {
  const createMockInvitation: Record.Factory<Invitation> = Record({
    id: 'id',
    name: name ?? 'member-name',
    email: email ?? 'email',
    creator: 'creator-id',
    itemPath,
  });
  const invitation: InvitationRecord = createMockInvitation();
  return invitation;
};

export const buildMockInvitations = (itemId: string) =>
  List([
    buildInvitationRecord({
      itemPath: itemId,
      email: 'a',
    }),
    buildInvitationRecord({
      itemPath: itemId,
      email: 'b',
    }),
  ]);

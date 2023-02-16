import { StatusCodes } from 'http-status-codes';
import { List, Record } from 'immutable';
import { v4 } from 'uuid';

import {
  AppItemExtraProperties,
  Category,
  CategoryType,
  ChatMention,
  ChatMessage,
  ExportedChatMessage,
  Flag,
  FolderItemType,
  GraaspError,
  HttpMethod,
  Invitation,
  ItemCategory,
  ItemLoginSchema,
  ItemMembership,
  ItemTag,
  ItemType,
  MAX_TARGETS_FOR_MODIFY_REQUEST,
  MAX_TARGETS_FOR_READ_REQUEST,
  Member,
  MemberMentions,
  MemberType,
  MentionStatus,
  PermissionLevel,
  UUID,
  convertJs,
} from '@graasp/sdk';
import {
  Action,
  ActionData,
  ActionDataRecord,
  ActionMetadata,
  ActionMetadataRecord,
  App,
  AppRecord,
  CategoryRecord,
  CategoryTypeRecord,
  ChatMentionRecord,
  ChatMessageRecord,
  ExportedChatMessageRecord,
  ExportedItemChatRecord,
  FlagRecord,
  FullValidation,
  FullValidationRecord,
  InvitationRecord,
  ItemCategoryRecord,
  ItemChatRecord,
  ItemLike,
  ItemLikeRecord,
  ItemLogin,
  ItemLoginRecord,
  ItemMembershipRecord,
  ItemRecord,
  ItemTagRecord,
  ItemValidationAndReview,
  ItemValidationAndReviewRecord,
  ItemValidationGroup,
  ItemValidationGroupRecord,
  MemberMentionsRecord,
  MemberRecord,
  Status,
  StatusRecord,
  TagRecord,
  Tag as TagType,
} from '@graasp/sdk/frontend';

export const WS_HOST = 'ws://localhost:3000';
export const API_HOST = 'http://localhost:3000';
export const DOMAIN = 'domain';
export const UNAUTHORIZED_RESPONSE: GraaspError = {
  name: 'unauthorized',
  code: 'ERRCODE',
  message: 'unauthorized error message',
  statusCode: StatusCodes.UNAUTHORIZED,
  origin: 'plugin',
};

const createMockFolderItem = (
  folderItem?: Partial<FolderItemType>,
): ItemRecord =>
  convertJs({
    id: '42',
    name: 'item1',
    path: '42',
    // clearly type enum for immutable record to correctly infer
    type: ItemType.FOLDER,
    description: '',
    extra: { [ItemType.FOLDER]: { childrenOrder: [] } },
    creator: 'creator',
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    settings: {},
    ...folderItem,
  });

const ITEM_1: ItemRecord = createMockFolderItem({
  id: '42',
  name: 'item1',
  path: '42',
});

const ITEM_2: ItemRecord = createMockFolderItem({
  id: '5243',
  name: 'item2',
  path: '5243',
});

const ITEM_3: ItemRecord = createMockFolderItem({
  id: '5896',
  name: 'item3',
  path: '5896',
});

const ITEM_4: ItemRecord = createMockFolderItem({
  id: 'dddd',
  name: 'item4',
  path: '5896.dddd',
});

const ITEM_5: ItemRecord = createMockFolderItem({
  id: 'eeee',
  name: 'item5',
  path: '5896.eeee',
});

const ITEM_6: ItemRecord = createMockFolderItem({
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
      createMockFolderItem({
        id: `item-${idx}`,
        name: `item-${idx}`,
        path: `item_${idx}`,
        description: '',
      }),
  ),
]);

export const MESSAGE_IDS = ['12345', '78945'];

const createMockMember = (member?: Partial<Member>): MemberRecord =>
  convertJs({
    id: '42',
    name: 'username',
    email: 'username@graasp.org',
    type: MemberType.Individual,
    extra: {},
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    ...member,
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

const createMockMembership = (
  membership?: Partial<ItemMembership>,
): ItemMembershipRecord =>
  convertJs({
    id: 'membership-id',
    memberId: 'member-id',
    itemPath: ITEMS.first()!.path,
    // clearly type enum for immutable record to correctly infer
    permission: PermissionLevel.Read as PermissionLevel,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    creator: 'creator-id',
    ...membership,
  });

const MEMBERSHIP_1: ItemMembershipRecord = createMockMembership({
  id: 'membership-id',
  memberId: 'member-id',
  permission: PermissionLevel.Read,
});

const MEMBERSHIP_2: ItemMembershipRecord = createMockMembership({
  id: 'membership-id1',
  memberId: 'member-id1',
  permission: PermissionLevel.Admin,
});

export const ITEM_MEMBERSHIPS_RESPONSE: List<ItemMembershipRecord> = List([
  MEMBERSHIP_1,
  MEMBERSHIP_2,
]);

const defaultItemLoginResponseValues: ItemLogin = {
  loginSchema: ItemLoginSchema.USERNAME,
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

const defaultAppExtraValues: AppItemExtraProperties = {
  url: 'http://codeapp.com/logo.png',
};
const createAppExtra: Record.Factory<AppItemExtraProperties> = Record(
  defaultAppExtraValues,
);

const defaultAppValues: App = {
  name: 'Code App',
  url: 'http://codeapp.com',
  description: 'description',
  extra: createAppExtra({ url: 'http://codeapp.com/logo.png' }),
};
const createMockApps: Record.Factory<App> = Record(defaultAppValues);

const APP_1: AppRecord = createMockApps({
  name: 'Code App',
  url: 'http://codeapp.com',
  description: 'description',
  extra: createAppExtra({ url: 'http://codeapp.com/logo.png' }),
});

const APP_2: AppRecord = createMockApps({
  name: 'File App',
  description: 'description',
  url: 'http://fileapp.com',
  extra: createAppExtra({ url: 'http://fileapp.com/logo.png' }),
});

export const APPS: List<AppRecord> = List([APP_1, APP_2]);

export const createMockChatMessage = (
  message?: Partial<ChatMessage>,
): ChatMessageRecord =>
  convertJs({
    id: '',
    chatId: '',
    body: 'some text',
    creator: 'somememberid',
    createdAt: 'someDate',
    updatedAt: 'someDate',
    ...message,
  });

export const createMockExportedChatMessage = (
  message?: Partial<ExportedChatMessage>,
): ExportedChatMessageRecord =>
  convertJs({
    id: '',
    chatId: '',
    body: 'some text',
    creator: 'somememberid',
    creatorName: 'Some Name',
    createdAt: 'someDate',
    updatedAt: 'someDate',
    ...message,
  });

export const createMockMemberMentions = (
  memberMentions?: Partial<MemberMentions>,
): MemberMentionsRecord =>
  convertJs({
    memberId: '',
    mentions: [],
    ...memberMentions,
  });

export const createMockItemChat = (
  itemId: string,
  messages?: ChatMessage[],
): ItemChatRecord =>
  convertJs({
    id: itemId,
    messages: messages || [],
  });

export const createMockExportedItemChat = (
  itemId: string,
  messages?: ExportedChatMessage[],
): ExportedItemChatRecord =>
  convertJs({ id: itemId, messages: messages || [] });

export const buildExportedChat = (
  id: UUID,
): List<ExportedChatMessageRecord> => {
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
}): ChatMentionRecord => {
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

export const buildMemberMentions = (memberId: string): MemberMentionsRecord => {
  const MEMBER_MENTIONS: MemberMentionsRecord = createMockMemberMentions({
    memberId,
    mentions: [
      {
        id: 'someid',
        itemPath: 'somepath',
        message: 'somemessage here',
        messageId: 'anotherid',
        createdAt: 'somedate',
        updatedAt: 'somedate',
        memberId,
        status: MentionStatus.UNREAD,
        creator: 'somememberid',
      },
      {
        id: 'someid',
        itemPath: 'somepath',
        message: 'somemessage here',
        messageId: 'anotherid',
        createdAt: 'somedate',
        updatedAt: 'somedate',
        memberId,
        status: MentionStatus.UNREAD,
        creator: 'somememberid',
      },
    ],
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

export const ITEM_CHAT: ItemChatRecord = createMockItemChat('item-id', [
  {
    id: MESSAGE_IDS[0],
    chatId: 'item-id',
    creator: MEMBER_RESPONSE.id,
    createdAt: 'someDate',
    updatedAt: 'someOtherDate',
    body: 'text',
  },
  {
    id: MESSAGE_IDS[1],
    chatId: 'item-id',
    creator: MEMBER_RESPONSE.id,
    createdAt: 'someDate',
    updatedAt: 'someOtherDate',
    body: 'text of second message',
  },
]);

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

const createMockFullValidation: Record.Factory<FullValidation> = Record({
  id: 'id-1',
  itemId: 'item-id-1',
  reviewStatusId: 'status-id-1',
  validationStatusId: 'status-id-2',
  validationResult: '',
  process: 'process-1',
  createdAt: new Date().toISOString(),
});

const FULL_VALIDATION_RECORDS_1: FullValidationRecord =
  createMockFullValidation({
    id: 'id-1',
    itemId: 'item-id-1',
    reviewStatusId: 'status-id-1',
    validationStatusId: 'status-id-2',
    validationResult: '',
    process: 'process-1',
  });

const FULL_VALIDATION_RECORDS_2: FullValidationRecord =
  createMockFullValidation({
    id: 'id-2',
    itemId: 'item-id-1',
    reviewStatusId: 'status-id-1',
    validationStatusId: 'status-id-2',
    validationResult: '',
    process: 'process-2',
  });

export const FULL_VALIDATION_RECORDS: List<FullValidationRecord> = List([
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

const buildAction = (action: Partial<Action>): Action => ({
  id: 'action-id',
  itemId: 'item-id',
  memberId: 'member-id',
  ...action,
});

const ACTION_1: Action = buildAction({
  id: 'action-id',
  itemId: 'item-id',
  memberId: 'member-id',
});

export const ACTIONS_LIST: Action[] = [ACTION_1];

const createMockActionMetadata = (actionList: Action[]): ActionMetadataRecord =>
  convertJs({
    numActionsRetrieved: actionList.length,
    requestedSampleSize: actionList.length,
  });

const ACTION_METADATA: ActionMetadataRecord =
  createMockActionMetadata(ACTIONS_LIST);

const createMockActionData = (
  actionData: Partial<ActionData>,
): ActionDataRecord =>
  convertJs({
    actions: [],
    members: [],
    descendants: [],
    itemMemberships: [],
    ...actionData,
  });

export const ACTIONS_DATA: ActionDataRecord = createMockActionData({
  actions: ACTIONS_LIST,
  members: [MEMBER_RESPONSE.toJS() as Member],
  item: ITEM_1.toJS() as FolderItemType,
  itemMemberships: [MEMBERSHIP_1.toJS()] as ItemMembership[],
  metadata: ACTION_METADATA.toJS() as ActionMetadata,
});

export const buildInvitation = ({
  itemPath,
  email,
  name,
}: {
  itemPath: UUID;
  email?: string;
  name?: string;
}): Invitation => ({
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
}): InvitationRecord => {
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

export const buildMockInvitations = (itemId: string): List<InvitationRecord> =>
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

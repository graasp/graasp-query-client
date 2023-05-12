import { StatusCodes } from 'http-status-codes';
import { List, Record } from 'immutable';
import { v4 } from 'uuid';

import {
  Action,
  ActionData,
  App,
  Category,
  CategoryType,
  ChatMention,
  ChatMessage,
  Context,
  ExportedChatMessage,
  FlagType,
  FolderItemType,
  GraaspError,
  HttpMethod,
  Invitation,
  Item,
  ItemCategory,
  ItemLoginSchemaType,
  ItemMembership,
  ItemTag,
  ItemTagType,
  ItemType,
  ItemValidationStatus,
  MAX_TARGETS_FOR_MODIFY_REQUEST,
  MAX_TARGETS_FOR_READ_REQUEST,
  Member,
  MemberType,
  MentionStatus,
  PermissionLevel,
  ResultOf,
  UUID,
  convertJs,
} from '@graasp/sdk';
import {
  ActionDataRecord,
  AppRecord,
  CategoryRecord,
  ChatMentionRecord,
  ChatMessageRecord,
  ExportedChatMessageRecord,
  ExportedItemChatRecord,
  InvitationRecord,
  ItemCategoryRecord,
  ItemChatRecord,
  ItemFlagRecord,
  ItemLikeRecord,
  ItemLoginSchemaRecord,
  ItemMembershipRecord,
  ItemPublishedRecord,
  ItemRecord,
  ItemTagRecord,
  ItemValidationGroupRecord,
  MemberRecord,
  RecycledItemDataRecord,
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
export const FILE_NOT_FOUND_RESPONSE: GraaspError = {
  name: 'unauthorized',
  code: 'GPFERR006',
  message: 'LOCAL_FILE_NOT_FOUND',
  statusCode: StatusCodes.NOT_FOUND,
  origin: 'graasp-plugin-file',
};

const getById = (obj: { id: UUID }) => obj.id;

export const buildResultOfData = <T>(
  data: T[],
  getKey?: (t: T) => string,
  errors?: Error[],
): ResultOf<T> => {
  const buildGetKey = getKey ?? getById;
  return {
    data: data
      // TODO
      .map((d: any) => ({ [buildGetKey(d)]: d }))
      .reduce((prev, curr) => ({ ...prev, ...curr }), {}),
    errors: errors ?? [],
  };
};

export const MESSAGE_IDS = ['12345', '78945'];

export const MOCK_MEMBER: Member = {
  id: '42',
  name: 'username',
  email: 'username@graasp.org',
  type: MemberType.Individual,
  extra: {},
  updatedAt: new Date(),
  createdAt: new Date(),
};

const createMockMember = (member?: Partial<Member>): MemberRecord =>
  convertJs({ ...MOCK_MEMBER, ...member });

export const MEMBER_RESPONSE: MemberRecord = createMockMember();

export const MOCK_ITEM: FolderItemType = {
  id: '42',
  name: 'item1',
  path: '42',
  description: '',
  creator: MOCK_MEMBER,
  updatedAt: new Date(),
  createdAt: new Date(),
  settings: {},
  type: ItemType.FOLDER,
  extra: {
    [ItemType.FOLDER]: {
      childrenOrder: [],
    },
  },
};

const createMockFolderItem = (
  folderItem?: Partial<FolderItemType>,
): FolderItemType => ({
  ...MOCK_ITEM,
  ...folderItem,
});

const ITEM_1: FolderItemType = createMockFolderItem({
  id: '42',
  name: 'item1',
  path: '42',
});

const ITEM_2: FolderItemType = createMockFolderItem({
  id: '5243',
  name: 'item2',
  path: '5243',
});

const ITEM_3: FolderItemType = createMockFolderItem({
  id: '5896',
  name: 'item3',
  path: '5896',
});

const ITEM_4: FolderItemType = createMockFolderItem({
  id: 'dddd',
  name: 'item4',
  path: '5896.dddd',
});

const ITEM_5: FolderItemType = createMockFolderItem({
  id: 'eeee',
  name: 'item5',
  path: '5896.eeee',
});

const ITEM_6: FolderItemType = createMockFolderItem({
  id: 'gggg',
  name: 'item5',
  path: '5896.gggg',
});

export const ITEMS_JS: Item[] = [
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
];
export const ITEMS: List<ItemRecord> = convertJs(ITEMS_JS);

export const MENTION_IDS = ['12345', '78945'];

export const RECYCLED_ITEM_DATA: RecycledItemDataRecord = convertJs([
  {
    id: `recycle-item-id`,
    item: ITEM_1,
  },
]);

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
    member: MEMBER_RESPONSE.toJS(),
    item: ITEM_1,
    // clearly type enum for immutable record to correctly infer
    permission: PermissionLevel.Read,
    createdAt: new Date('2023-04-26T08:46:34.812Z'),
    updatedAt: new Date('2023-04-26T08:46:34.812Z'),
    creator: MEMBER_RESPONSE.toJS(),
    ...membership,
  });

const MEMBERSHIP_1: ItemMembershipRecord = createMockMembership({
  id: 'membership-id',
  member: MOCK_MEMBER,
  permission: PermissionLevel.Read,
});

const MEMBERSHIP_2: ItemMembershipRecord = createMockMembership({
  id: 'membership-id1',
  member: MOCK_MEMBER,

  permission: PermissionLevel.Admin,
});

export const ITEM_MEMBERSHIPS_RESPONSE: List<ItemMembershipRecord> = List([
  MEMBERSHIP_1,
  MEMBERSHIP_2,
]);

export const ITEM_LOGIN_RESPONSE: ItemLoginSchemaRecord = convertJs({
  type: ItemLoginSchemaType.Username,
  item: ITEMS_JS[0],
  createdAt: new Date(),
  updatedAt: new Date(),
  id: 'login-schema-id',
});

const BlobMock = {
  blob: () => 'blob',
};

export const FILE_RESPONSE = 'somedata';

export const S3_FILE_RESPONSE = {
  key: 'someurl',
};
export const S3_FILE_BLOB_RESPONSE = BlobMock;
export const THUMBNAIL_BLOB_RESPONSE = BlobMock;
export const THUMBNAIL_URL_RESPONSE = 'some-thumbnail-url';
export const AVATAR_BLOB_RESPONSE = BlobMock;
export const AVATAR_URL_RESPONSE = 'some-avatar-url';

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

const defaultAppValues: App = {
  name: 'Code App',
  url: 'http://codeapp.com',
  description: 'description',
  id: 'app-id',
  key: 'key',
  extra: {},
  publisher: {
    id: 'publisher-id',
    name: 'publisher name',
    origins: ['origin'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  createdAt: new Date(),
  updatedAt: new Date(),
};

const APP_1: AppRecord = convertJs({
  ...defaultAppValues,
  name: 'Code App',
  url: 'http://codeapp.com',
  description: 'description',
});

const APP_2: AppRecord = convertJs({
  ...defaultAppValues,
  name: 'File App',
  description: 'description',
  url: 'http://fileapp.com',
  extra: { url: 'http://fileapp.com/logo.png' },
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
  memberMentions?: Partial<ChatMention>[],
): List<ChatMentionRecord> => convertJs(memberMentions);

export const createMockItemChat = (messages?: ChatMessage[]): ItemChatRecord =>
  convertJs(messages);

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
      creator: MOCK_MEMBER,
    });
  const CHAT_MESSAGE_2: ExportedChatMessageRecord =
    createMockExportedChatMessage({
      id: v4(),
      chatId: id,
      body: 'some other text',
      creator: MOCK_MEMBER,
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
  member,
  status = MentionStatus.Unread,
}: {
  id?: UUID;
  member: Member;
  status?: MentionStatus;
}): ChatMentionRecord => {
  const defaultChatMentionValues: ChatMention = {
    id: 'someid',
    message: {
      id: 'anotherid',
      item: MOCK_ITEM,
      createdAt: new Date(),
      updatedAt: new Date(),
      body: 'somemessage here',
      creator: MOCK_MEMBER,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    member: member ?? MOCK_MEMBER,
    status: MentionStatus.Unread,
  };
  const createMockChatMention = (
    values: Partial<ChatMention>,
  ): ChatMentionRecord => convertJs({ ...values, ...defaultChatMentionValues });

  const CHAT_MENTION: ChatMentionRecord = createMockChatMention({
    id,
    member: MOCK_MEMBER,
    status,
  });
  return CHAT_MENTION;
};

export const buildMemberMentions = (): List<ChatMentionRecord> => {
  const MEMBER_MENTIONS: List<ChatMentionRecord> = createMockMemberMentions([
    {
      id: 'someid',
      message: {
        id: 'anotherid',
        item: MOCK_ITEM,
        createdAt: new Date(),
        updatedAt: new Date(),
        body: 'somemessage here',
        creator: MOCK_MEMBER,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      member: MOCK_MEMBER,
      status: MentionStatus.Unread,
    },
    {
      id: 'someid',
      message: {
        id: 'anotherid',
        item: MOCK_ITEM,
        createdAt: new Date(),
        updatedAt: new Date(),
        body: 'somemessage here',
        creator: MOCK_MEMBER,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      member: MOCK_MEMBER,
      status: MentionStatus.Unread,
    },
  ]);
  return MEMBER_MENTIONS;
};

const defaultItemTagsValues: ItemTag = {
  id: 'tag-id',
  item: MOCK_ITEM,
  type: ItemTagType.PUBLIC,
  createdAt: new Date(),
  creator: MOCK_MEMBER,
};
const createMockItemTags = (values: Partial<ItemTag>): ItemTagRecord =>
  convertJs({ ...defaultItemTagsValues, ...values });

const ITEM_TAG_1: ItemTagRecord = createMockItemTags({
  id: 'tag-id',
  item: MOCK_ITEM,
  type: ItemTagType.PUBLIC,
});

const ITEM_TAG_2: ItemTagRecord = createMockItemTags({
  id: 'tag-id1',
  item: MOCK_ITEM,
  type: ItemTagType.PUBLIC,
});

export const ITEM_TAGS: List<ItemTagRecord> = List([ITEM_TAG_1, ITEM_TAG_2]);

export const ITEM_CHAT: ItemChatRecord = createMockItemChat([
  {
    id: MESSAGE_IDS[0],
    item: ITEM_1,
    creator: MOCK_MEMBER,
    createdAt: new Date(),
    updatedAt: new Date(),
    body: 'text',
  },
  {
    id: MESSAGE_IDS[1],
    item: ITEM_1,
    creator: MOCK_MEMBER,
    createdAt: new Date(),
    updatedAt: new Date(),
    body: 'text of second message',
  },
]);

const defaultCategoryValues: Category = {
  id: 'category-id1',
  name: 'category-name1',
  type: CategoryType.DISCIPLINE,
};
const createMockCategory: Record.Factory<Category> = Record(
  defaultCategoryValues,
);

const CATEGORY_1: CategoryRecord = createMockCategory({
  id: 'category-id1',
  name: 'category-name1',
  type: CategoryType.DISCIPLINE,
});

const CATEGORY_2: CategoryRecord = createMockCategory({
  id: 'category-id2',
  name: 'category-name2',
  type: CategoryType.DISCIPLINE,
});

export const CATEGORIES: List<CategoryRecord> = List([CATEGORY_1, CATEGORY_2]);

const defaultItemCategoryValues: ItemCategory = {
  id: 'id1',
  item: MOCK_ITEM,
  category: defaultCategoryValues,
  createdAt: new Date(),
  creator: MOCK_MEMBER,
};
const createMockItemCategory = (
  values: Partial<ItemCategory>,
): ItemCategoryRecord => convertJs({ ...values, ...defaultItemCategoryValues });

const ITEM_CATEGORY_1: ItemCategoryRecord = createMockItemCategory({
  id: 'id1',
  item: MOCK_ITEM,
  category: defaultCategoryValues,
});

const ITEM_CATEGORY_2: ItemCategoryRecord = createMockItemCategory({
  id: 'id2',
  item: MOCK_ITEM,
  category: defaultCategoryValues,
});

export const ITEM_CATEGORIES: List<ItemCategoryRecord> = List([
  ITEM_CATEGORY_1,
  ITEM_CATEGORY_2,
]);
export const ITEM_LIKES: List<ItemLikeRecord> = convertJs([
  {
    id: 'id1',
    item: MOCK_ITEM,
    member: MOCK_MEMBER,
    createdAt: new Date(),
  },
  {
    id: 'id2',
    item: MOCK_ITEM,
    member: MOCK_MEMBER,
    createdAt: new Date(),
  },
]);

export const ITEM_VALIDATION_GROUP: ItemValidationGroupRecord = convertJs({
  id: 'id-1',
  item: MOCK_ITEM,
  itemValidations: [
    {
      id: 'id-1',
      item: MOCK_ITEM,
      status: ItemValidationStatus.Success,
      process: 'process-1',
      createdAt: new Date(),
    },
  ],
  updatedAt: new Date(),
  createdAt: new Date(),
});

const ACTION_1: Action = {
  id: 'action-id',
  item: MOCK_ITEM,
  member: MOCK_MEMBER,
  createdAt: new Date(),
  view: Context.Analytics,
  type: 'action-type',
  extra: { some: 'value' },
};

export const ACTIONS_LIST: Action[] = [ACTION_1];

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
  item: ITEM_1,
  itemMemberships: [MEMBERSHIP_1.toJS()] as ItemMembership[],
  metadata: {
    numActionsRetrieved: 3,
    requestedSampleSize: 24,
  },
});

export const buildInvitation = (values: Partial<Invitation>): Invitation => ({
  id: 'id',
  name: 'member-name',
  email: 'email',
  creator: MOCK_MEMBER,
  permission: PermissionLevel.Read,
  item: MOCK_ITEM,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...values,
});

export const buildInvitationRecord = (
  values: Partial<Invitation>,
): InvitationRecord => convertJs(buildInvitation(values));

export const buildMockInvitations = (itemId: string): List<InvitationRecord> =>
  convertJs([
    buildInvitation({
      item: {
        ...MOCK_ITEM,
        path: itemId,
      },
      email: 'a',
    }),
    buildInvitation({
      item: {
        ...MOCK_ITEM,
        path: itemId,
      },
      email: 'b',
    }),
  ]);

export const ITEM_FLAGS: ItemFlagRecord[] = [
  convertJs({
    id: 'item-flag-1',
    type: FlagType.FALSE_INFORMATION,
  }),
];

export const ITEM_PUBLISHED_DATA: ItemPublishedRecord = convertJs({
  id: 'item-published-id',
  item: ITEM_1,
  member: MEMBER_RESPONSE.toJS(),
});

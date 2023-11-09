import {
  Action,
  ActionData,
  App,
  Category,
  CategoryType,
  ChatMention,
  ChatMessage,
  CompleteMember,
  Context,
  DiscriminatedItem,
  ExportedChatMessage,
  FlagType,
  FolderItemType,
  GraaspError,
  HttpMethod,
  Invitation,
  ItemCategory,
  ItemFavorite,
  ItemFlag,
  ItemLike,
  ItemLoginSchema,
  ItemLoginSchemaType,
  ItemMembership,
  ItemPublished,
  ItemTag,
  ItemTagType,
  ItemType,
  ItemValidationGroup,
  ItemValidationProcess,
  ItemValidationStatus,
  MAX_TARGETS_FOR_MODIFY_REQUEST,
  MAX_TARGETS_FOR_READ_REQUEST,
  Member,
  MemberType,
  MentionStatus,
  PermissionLevel,
  RecycledItemData,
  ResultOf,
  UUID,
} from '@graasp/sdk';

import { StatusCodes } from 'http-status-codes';
import { v4 } from 'uuid';

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
      // TODO: use a better generic type
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
};

export const MOCK_COMPLETE_MEMBER: CompleteMember = {
  ...MOCK_MEMBER,
  type: MemberType.Individual,
  extra: {},
  updatedAt: '2023-09-06T11:50:32.894Z',
  createdAt: '2023-09-06T11:50:32.894Z',
};

const createMockMember = (member?: Partial<Member>): Member => ({
  ...MOCK_MEMBER,
  ...member,
});

export const MEMBER_RESPONSE: Member = createMockMember();

export const MOCK_ITEM: FolderItemType = {
  id: '42',
  name: 'item1',
  path: '42',
  description: '',
  creator: MOCK_MEMBER,
  updatedAt: '2023-09-06T11:50:32.894Z',
  createdAt: '2023-09-06T11:50:32.894Z',
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

export const ITEMS: DiscriminatedItem[] = [
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

export const MENTION_IDS = ['12345', '78945'];

export const RECYCLED_ITEM_DATA: RecycledItemData[] = [
  {
    id: `recycle-item-id`,
    item: ITEM_1,
    creator: MEMBER_RESPONSE,
    createdAt: '2023-09-06T11:50:32.894Z',
  },
  {
    id: `recycle-item-id-1`,
    item: ITEM_2,
    creator: MEMBER_RESPONSE,
    createdAt: '2023-09-06T11:50:32.894Z',
  },
  {
    id: `recycle-item-id-2`,
    item: ITEM_3,
    creator: MEMBER_RESPONSE,
    createdAt: '2023-09-06T11:50:32.894Z',
  },
];

export const FAVORITE_ITEM: ItemFavorite[] = [
  {
    id: `favorite-item-id`,
    item: ITEM_1,
    createdAt: '2023-09-06T11:50:32.894Z',
  },
];

const MEMBER_RESPONSE_2: Member = createMockMember({
  id: '421',
  name: 'username1',
  email: 'username1@graasp.org',
});

export const MEMBERS_RESPONSE: Member[] = [
  MEMBER_RESPONSE,
  MEMBER_RESPONSE_2,
  ...Array.from({ length: MAX_TARGETS_FOR_READ_REQUEST }, (_, idx) =>
    createMockMember({
      id: idx.toString(),
      name: `username-${idx}`,
      email: `username-${idx}@graasp.org`,
    }),
  ),
];

export const OK_RESPONSE = {};

const createMockMembership = (
  membership?: Partial<ItemMembership>,
): ItemMembership => ({
  id: 'membership-id',
  member: MEMBER_RESPONSE,
  item: ITEM_1,
  permission: PermissionLevel.Read,
  createdAt: '2023-04-26T08:46:34.812Z',
  updatedAt: '2023-04-26T08:46:34.812Z',
  creator: MEMBER_RESPONSE,
  ...membership,
});

const MEMBERSHIP_1: ItemMembership = createMockMembership({
  id: 'membership-id',
  member: MOCK_MEMBER,
  permission: PermissionLevel.Read,
});

const MEMBERSHIP_2: ItemMembership = createMockMembership({
  id: 'membership-id1',
  member: MOCK_MEMBER,
  permission: PermissionLevel.Admin,
});

export const ITEM_MEMBERSHIPS_RESPONSE: ItemMembership[] = [
  MEMBERSHIP_1,
  MEMBERSHIP_2,
];

export const ITEM_LOGIN_RESPONSE: ItemLoginSchema = {
  type: ItemLoginSchemaType.Username,
  item: ITEMS[0],
  createdAt: '2023-09-06T11:50:32.894Z',
  updatedAt: '2023-09-06T11:50:32.894Z',
  id: 'login-schema-id',
};

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
    createdAt: '2023-09-06T11:50:32.894Z',
    updatedAt: '2023-09-06T11:50:32.894Z',
  },
  createdAt: '2023-09-06T11:50:32.894Z',
  updatedAt: '2023-09-06T11:50:32.894Z',
};

const APP_1: App = {
  ...defaultAppValues,
  name: 'Code App',
  url: 'http://codeapp.com',
  description: 'description',
};

const APP_2: App = {
  ...defaultAppValues,
  name: 'File App',
  description: 'description',
  url: 'http://fileapp.com',
  extra: { image: 'http://fileapp.com/logo.png' },
};

export const APPS = [APP_1, APP_2];

export const createMockChatMessage = (
  message?: Partial<ChatMessage>,
): ChatMessage => ({
  id: '',
  body: 'some text',
  creator: MEMBER_RESPONSE,
  createdAt: '2023-09-06T11:50:32.894Z',
  updatedAt: '2023-09-06T11:50:32.894Z',
  item: ITEM_1,
  ...message,
});

export const createMockExportedChatMessage = (
  message?: Partial<ExportedChatMessage>,
): ExportedChatMessage => ({
  id: '',
  chatId: '',
  body: 'some text',
  creatorName: 'Some Name',
  creator: MEMBER_RESPONSE,
  createdAt: '2023-09-06T11:50:32.894Z',
  updatedAt: '2023-09-06T11:50:32.894Z',
  ...message,
});

export const createMockMemberMentions = (
  memberMentions?: Partial<ChatMention>[],
): ChatMention => ({
  id: 'UUID',
  message: createMockChatMessage(),
  member: MEMBER_RESPONSE,
  createdAt: '2023-09-06T11:50:32.894Z',
  updatedAt: '2023-09-06T11:50:32.894Z',
  status: MentionStatus.Read,
  ...memberMentions,
});

export const buildChatMention = ({
  id = v4(),
  member = MOCK_MEMBER,
  status = MentionStatus.Unread,
}: {
  id?: UUID;
  member?: Member;
  status?: MentionStatus;
}): ChatMention => ({
  id,
  member,
  status,
  message: {
    id: 'anotherid',
    item: MOCK_ITEM,
    createdAt: '2023-09-06T11:50:32.894Z',
    updatedAt: '2023-09-06T11:50:32.894Z',
    body: 'somemessage here',
    creator: MOCK_MEMBER,
  },
  createdAt: '2023-09-06T11:50:32.894Z',
  updatedAt: '2023-09-06T11:50:32.894Z',
});

export const buildMemberMentions = (): ChatMention[] => {
  const MEMBER_MENTIONS = [
    {
      id: 'someid',
      message: {
        id: 'anotherid',
        item: MOCK_ITEM,
        createdAt: '2023-09-06T11:50:32.894Z',
        updatedAt: '2023-09-06T11:50:32.894Z',
        body: 'somemessage here',
        creator: MOCK_MEMBER,
      },
      createdAt: '2023-09-06T11:50:32.894Z',
      updatedAt: '2023-09-06T11:50:32.894Z',
      member: MOCK_MEMBER,
      status: MentionStatus.Unread,
    },
    {
      id: 'someOtherId',
      message: {
        id: 'anotherid',
        item: MOCK_ITEM,
        createdAt: '2023-09-06T11:50:32.894Z',
        updatedAt: '2023-09-06T11:50:32.894Z',
        body: 'somemessage here',
        creator: MOCK_MEMBER,
      },
      createdAt: '2023-09-06T11:50:32.894Z',
      updatedAt: '2023-09-06T11:50:32.894Z',
      member: MOCK_MEMBER,
      status: MentionStatus.Unread,
    },
  ];
  return MEMBER_MENTIONS;
};

const defaultItemTagsValues: ItemTag = {
  id: 'tag-id',
  item: MOCK_ITEM,
  type: ItemTagType.Public,
  createdAt: '2023-09-06T11:50:32.894Z',
  creator: MOCK_MEMBER,
};
const createMockItemTags = (values: Partial<ItemTag>): ItemTag => ({
  ...defaultItemTagsValues,
  ...values,
});

const ITEM_TAG_1: ItemTag = createMockItemTags({
  id: 'tag-id',
  item: MOCK_ITEM,
  type: ItemTagType.Public,
});

const ITEM_TAG_2: ItemTag = createMockItemTags({
  id: 'tag-id1',
  item: MOCK_ITEM,
  type: ItemTagType.Public,
});

export const ITEM_TAGS = [ITEM_TAG_1, ITEM_TAG_2];

export const CHAT_MESSAGES: ChatMessage[] = [
  {
    id: MESSAGE_IDS[0],
    item: ITEM_1,
    creator: MOCK_MEMBER,
    createdAt: '2023-09-06T11:50:32.894Z',
    updatedAt: '2023-09-06T11:50:32.894Z',
    body: 'text',
  },
  {
    id: MESSAGE_IDS[1],
    item: ITEM_1,
    creator: MOCK_MEMBER,
    createdAt: '2023-09-06T11:50:32.894Z',
    updatedAt: '2023-09-06T11:50:32.894Z',
    body: 'text of second message',
  },
];

const defaultCategoryValues: Category = {
  id: 'category-id1',
  name: 'category-name1',
  type: CategoryType.Discipline,
};

const CATEGORY_1: Category = {
  id: 'category-id1',
  name: 'category-name1',
  type: CategoryType.Discipline,
};

const CATEGORY_2: Category = {
  id: 'category-id2',
  name: 'category-name2',
  type: CategoryType.Discipline,
};

export const CATEGORIES = [CATEGORY_1, CATEGORY_2];

const defaultItemCategoryValues: ItemCategory = {
  id: 'id1',
  item: MOCK_ITEM,
  category: defaultCategoryValues,
  createdAt: '2023-09-06T11:50:32.894Z',
  creator: MOCK_MEMBER,
};
const createMockItemCategory = (
  values: Partial<ItemCategory>,
): ItemCategory => ({ ...values, ...defaultItemCategoryValues });

const ITEM_CATEGORY_1: ItemCategory = createMockItemCategory({
  id: 'id1',
  item: MOCK_ITEM,
  category: defaultCategoryValues,
});

const ITEM_CATEGORY_2: ItemCategory = createMockItemCategory({
  id: 'id2',
  item: MOCK_ITEM,
  category: defaultCategoryValues,
});

export const ITEM_CATEGORIES = [ITEM_CATEGORY_1, ITEM_CATEGORY_2];

const buildItemLikes = (): ItemLike[] => [
  {
    id: 'id1',
    item: MOCK_ITEM,
    createdAt: '2023-09-06T11:50:32.894Z',
  },
  {
    id: 'id2',
    item: MOCK_ITEM,
    createdAt: '2023-09-06T11:50:32.894Z',
  },
];
export const ITEM_LIKES: ItemLike[] = buildItemLikes();

export const ITEM_VALIDATION_GROUP: ItemValidationGroup = {
  id: 'id-1',
  item: MOCK_ITEM,
  itemValidations: [
    {
      id: 'id-1',
      item: MOCK_ITEM,
      status: ItemValidationStatus.Success,
      process: ItemValidationProcess.BadWordsDetection,
      createdAt: '2023-09-06T11:50:32.894Z',
      result: '',
      itemValidationGroup: { id: 'groupid' } as ItemValidationGroup,
      updatedAt: '2023-09-06T11:50:32.894Z',
    },
  ],
  createdAt: '2023-09-06T11:50:32.894Z',
};

const ACTION_1: Action = {
  id: 'action-id',
  item: MOCK_ITEM,
  member: MOCK_MEMBER,
  createdAt: '2023-09-06T11:50:32.894Z',
  view: Context.Analytics,
  type: 'action-type',
  extra: { some: 'value' },
};

export const ACTIONS_LIST: Action[] = [ACTION_1];

// todo: need to fix the type of item to DiscriminatedItem instead of Item
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const createMockActionData = (actionData: Partial<ActionData>): ActionData => ({
  actions: [],
  members: [],
  descendants: [],
  itemMemberships: [],
  ...actionData,
});

export const ACTIONS_DATA: ActionData = createMockActionData({
  actions: ACTIONS_LIST,
  members: [MEMBER_RESPONSE],
  item: ITEM_1,
  itemMemberships: [MEMBERSHIP_1],
  metadata: {
    numActionsRetrieved: 3,
    requestedSampleSize: 24,
  },
});
export const MEMBER_PUBLIC_PROFILE = {
  member: MEMBER_RESPONSE,
  bio: 'some random bio',
  visibility: true,
  linkedinLink: 'https://linkedin.com/user',
  facebookLink: 'https://facebook.com/user',
  twitterLink: 'https://twitter.com/user',
};

export const AGGREGATE_ACTIONS_DATA = [
  { aggregateResult: 1.5, createdDay: '2023-10-10T00:00:00.000Z' },
  { aggregateResult: 2, createdDay: '2023-07-10T00:00:00.000Z' },
  { aggregateResult: 4, createdDay: '2023-11-10T00:00:00.000Z' },
];

export const buildInvitation = (values: Partial<Invitation>): Invitation => ({
  id: 'id',
  name: 'member-name',
  email: 'email',
  creator: MOCK_MEMBER,
  permission: PermissionLevel.Read,
  item: MOCK_ITEM,
  createdAt: '2023-09-06T11:50:32.894Z',
  updatedAt: '2023-09-06T11:50:32.894Z',
  ...values,
});

export const buildMockInvitations = (itemId: string) => [
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
];

export const ITEM_FLAGS: ItemFlag[] = [
  {
    id: 'item-flag-1',
    type: FlagType.FalseInformation,
    item: ITEM_1,
    creator: MEMBER_RESPONSE,
    createdAt: '2023-09-06T11:50:32.894Z',
  },
];

export const ITEM_PUBLISHED_DATA: ItemPublished = {
  id: 'item-published-id',
  item: ITEM_1,
  createdAt: '2023-09-06T11:50:32.894Z',
  totalViews: 1,
};

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
  FolderItemFactory,
  HttpMethod,
  Invitation,
  ItemBookmark,
  ItemCategory,
  ItemFlag,
  ItemGeolocation,
  ItemLike,
  ItemLoginSchema,
  ItemLoginSchemaType,
  ItemMembership,
  ItemPublished,
  ItemTag,
  ItemTagType,
  ItemValidationGroup,
  ItemValidationProcess,
  ItemValidationStatus,
  Member,
  MemberFactory,
  MentionStatus,
  PermissionLevel,
  RecycledItemData,
  ResultOf,
  UUID,
} from '@graasp/sdk';

import { StatusCodes } from 'http-status-codes';
import { v4 } from 'uuid';

type MockFastifyError = {
  name: string;
  code: string;
  message: string;
  statusCode: number;
  origin: string;
};

export const WS_HOST = 'ws://localhost:3000';
export const API_HOST = 'http://localhost:3000';
export const DOMAIN = 'domain';
export const UNAUTHORIZED_RESPONSE: MockFastifyError = {
  name: 'unauthorized',
  code: 'ERRCODE',
  message: 'unauthorized error message',
  statusCode: StatusCodes.UNAUTHORIZED,
  origin: 'plugin',
};
export const FILE_NOT_FOUND_RESPONSE: MockFastifyError = {
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

export const generateFolders = (nb: number = 5) =>
  Array.from({ length: nb }, () => FolderItemFactory());

export const generateMembers = (nb: number = 5) =>
  Array.from({ length: nb }, () => MemberFactory());

export const RECYCLED_ITEM_DATA: RecycledItemData[] = [
  {
    id: `recycle-item-id`,
    item: FolderItemFactory(),
    creator: MemberFactory(),
    createdAt: '2023-09-06T11:50:32.894Z',
  },
  {
    id: `recycle-item-id-1`,
    item: FolderItemFactory(),
    creator: MemberFactory(),
    createdAt: '2023-09-06T11:50:32.894Z',
  },
  {
    id: `recycle-item-id-2`,
    item: FolderItemFactory(),
    creator: MemberFactory(),
    createdAt: '2023-09-06T11:50:32.894Z',
  },
];

export const FAVORITE_ITEM: ItemBookmark[] = [
  {
    id: `favorite-item-id`,
    item: FolderItemFactory(),
    createdAt: '2023-09-06T11:50:32.894Z',
  },
];

export const OK_RESPONSE = {};

export const createMockMembership = (
  membership?: Partial<ItemMembership>,
): ItemMembership => ({
  id: 'membership-id',
  member: MemberFactory(),
  item: FolderItemFactory(),
  permission: PermissionLevel.Read,
  createdAt: '2023-04-26T08:46:34.812Z',
  updatedAt: '2023-04-26T08:46:34.812Z',
  creator: MemberFactory(),
  ...membership,
});

const MEMBERSHIP_1: ItemMembership = createMockMembership({
  id: 'membership-id',
  member: MemberFactory(),
  permission: PermissionLevel.Read,
});

const MEMBERSHIP_2: ItemMembership = createMockMembership({
  id: 'membership-id1',
  member: MemberFactory(),
  permission: PermissionLevel.Admin,
});

export const ITEM_MEMBERSHIPS_RESPONSE: ItemMembership[] = [
  MEMBERSHIP_1,
  MEMBERSHIP_2,
];

export const ITEM_LOGIN_RESPONSE: ItemLoginSchema = {
  type: ItemLoginSchemaType.Username,
  item: FolderItemFactory(),
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
  creator: MemberFactory(),
  createdAt: '2023-09-06T11:50:32.894Z',
  updatedAt: '2023-09-06T11:50:32.894Z',
  item: FolderItemFactory(),
  ...message,
});

export const createMockExportedChatMessage = (
  message?: Partial<ExportedChatMessage>,
): ExportedChatMessage => ({
  id: '',
  chatId: '',
  body: 'some text',
  creatorName: 'Some Name',
  creator: MemberFactory(),
  createdAt: '2023-09-06T11:50:32.894Z',
  updatedAt: '2023-09-06T11:50:32.894Z',
  ...message,
});

export const createMockMemberMentions = (
  memberMentions?: Partial<ChatMention>[],
): ChatMention => ({
  id: 'UUID',
  message: createMockChatMessage(),
  member: MemberFactory(),
  createdAt: '2023-09-06T11:50:32.894Z',
  updatedAt: '2023-09-06T11:50:32.894Z',
  status: MentionStatus.Read,
  ...memberMentions,
});

export const buildChatMention = ({
  id = v4(),
  member = MemberFactory(),
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
    item: FolderItemFactory(),
    createdAt: '2023-09-06T11:50:32.894Z',
    updatedAt: '2023-09-06T11:50:32.894Z',
    body: 'somemessage here',
    creator: MemberFactory(),
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
        item: FolderItemFactory(),
        createdAt: '2023-09-06T11:50:32.894Z',
        updatedAt: '2023-09-06T11:50:32.894Z',
        body: 'somemessage here',
        creator: MemberFactory(),
      },
      createdAt: '2023-09-06T11:50:32.894Z',
      updatedAt: '2023-09-06T11:50:32.894Z',
      member: MemberFactory(),
      status: MentionStatus.Unread,
    },
    {
      id: 'someOtherId',
      message: {
        id: 'anotherid',
        item: FolderItemFactory(),
        createdAt: '2023-09-06T11:50:32.894Z',
        updatedAt: '2023-09-06T11:50:32.894Z',
        body: 'somemessage here',
        creator: MemberFactory(),
      },
      createdAt: '2023-09-06T11:50:32.894Z',
      updatedAt: '2023-09-06T11:50:32.894Z',
      member: MemberFactory(),
      status: MentionStatus.Unread,
    },
  ];
  return MEMBER_MENTIONS;
};

const defaultItemTagsValues: ItemTag = {
  id: 'tag-id',
  item: FolderItemFactory(),
  type: ItemTagType.Public,
  createdAt: '2023-09-06T11:50:32.894Z',
  creator: MemberFactory(),
};
const createMockItemTags = (values: Partial<ItemTag>): ItemTag => ({
  ...defaultItemTagsValues,
  ...values,
});

const ITEM_TAG_1: ItemTag = createMockItemTags({
  id: 'tag-id',
  item: FolderItemFactory(),
  type: ItemTagType.Public,
});

const ITEM_TAG_2: ItemTag = createMockItemTags({
  id: 'tag-id1',
  item: FolderItemFactory(),
  type: ItemTagType.Public,
});

export const ITEM_TAGS = [ITEM_TAG_1, ITEM_TAG_2];

export const CHAT_MESSAGES: ChatMessage[] = [
  {
    id: v4(),
    item: FolderItemFactory(),
    creator: MemberFactory(),
    createdAt: '2023-09-06T11:50:32.894Z',
    updatedAt: '2023-09-06T11:50:32.894Z',
    body: 'text',
  },
  {
    id: v4(),
    item: FolderItemFactory(),
    creator: MemberFactory(),
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
  item: FolderItemFactory(),
  category: defaultCategoryValues,
  createdAt: '2023-09-06T11:50:32.894Z',
  creator: MemberFactory(),
};
const createMockItemCategory = (
  values: Partial<ItemCategory>,
): ItemCategory => ({ ...values, ...defaultItemCategoryValues });

const ITEM_CATEGORY_1: ItemCategory = createMockItemCategory({
  id: 'id1',
  item: FolderItemFactory(),
  category: defaultCategoryValues,
});

const ITEM_CATEGORY_2: ItemCategory = createMockItemCategory({
  id: 'id2',
  item: FolderItemFactory(),
  category: defaultCategoryValues,
});

export const ITEM_CATEGORIES = [ITEM_CATEGORY_1, ITEM_CATEGORY_2];

const buildItemLikes = (): ItemLike[] => [
  {
    id: 'id1',
    item: FolderItemFactory(),
    createdAt: '2023-09-06T11:50:32.894Z',
  },
  {
    id: 'id2',
    item: FolderItemFactory(),
    createdAt: '2023-09-06T11:50:32.894Z',
  },
];
export const ITEM_LIKES: ItemLike[] = buildItemLikes();

export const ITEM_VALIDATION_GROUP: ItemValidationGroup = {
  id: 'id-1',
  item: FolderItemFactory(),
  itemValidations: [
    {
      id: 'id-1',
      item: FolderItemFactory(),
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
  item: FolderItemFactory(),
  member: MemberFactory(),
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
  members: [MemberFactory()],
  item: FolderItemFactory(),
  itemMemberships: [MEMBERSHIP_1],
  metadata: {
    numActionsRetrieved: 3,
    requestedSampleSize: 24,
  },
});
export const MEMBER_PUBLIC_PROFILE = {
  member: MemberFactory(),
  bio: 'some random bio',
  visibility: true,
  linkedinID: 'user',
  facebookID: 'user',
  twitterLink: 'user',
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
  creator: MemberFactory(),
  permission: PermissionLevel.Read,
  item: FolderItemFactory(),
  createdAt: '2023-09-06T11:50:32.894Z',
  updatedAt: '2023-09-06T11:50:32.894Z',
  ...values,
});

export const buildMockInvitations = (itemId: string) => [
  buildInvitation({
    item: {
      ...FolderItemFactory(),
      path: itemId,
    },
    email: 'a',
  }),
  buildInvitation({
    item: {
      ...FolderItemFactory(),
      path: itemId,
    },
    email: 'b',
  }),
];

export const ITEM_FLAGS: ItemFlag[] = [
  {
    id: 'item-flag-1',
    type: FlagType.FalseInformation,
    item: FolderItemFactory(),
    creator: MemberFactory(),
    createdAt: '2023-09-06T11:50:32.894Z',
  },
];

export const ITEM_PUBLISHED_DATA: ItemPublished = {
  id: 'item-published-id',
  item: FolderItemFactory(),
  createdAt: '2023-09-06T11:50:32.894Z',
  totalViews: 1,
};

export const ITEM_GEOLOCATION: ItemGeolocation = {
  id: 'item-published-id',
  item: FolderItemFactory(),
  lat: 1,
  lng: 1,
  country: 'DE',
  createdAt: '2023-09-06T11:50:32.894Z',
  updatedAt: '2023-09-06T11:50:32.894Z',
};

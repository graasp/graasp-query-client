import { StatusCodes } from 'http-status-codes';
import { List, Record, RecordOf } from 'immutable';

import {
  Item,
  ItemLogin,
  ItemValidationAndReview,
  ITEM_LOGIN_SCHEMAS,
  ITEM_TYPES,
  Member,
  Membership,
  PERMISSION_LEVELS,
  UUID,
} from '../src/types';

export const WS_HOST = 'ws://localhost:3000';
export const API_HOST = 'http://localhost:3000';
export const DOMAIN = 'domain';
export const UNAUTHORIZED_RESPONSE = {
  name: 'unauthorized',
  code: 'ERRCODE',
  message: 'unauthorized error message',
  statusCode: StatusCodes.UNAUTHORIZED,
};

const defaultItemValues: Item = {
  id: '42',
  name: 'item1',
  path: '42',
  type: ITEM_TYPES.FOLDER,
  description: '',
  extra: Record({}),
};
const makeItem: Record.Factory<Item> = Record(defaultItemValues);

const defaultItemExtraValues: any = {};
const makeItemExtra: Record.Factory<any> = Record(defaultItemExtraValues);

const extra: RecordOf<any> = makeItemExtra({});

const item1: RecordOf<Item> = makeItem({
  id: '42',
  name: 'item1',
  path: '42',
  type: ITEM_TYPES.FOLDER,
  description: '',
  extra: extra,
});

const item2: RecordOf<Item> = makeItem({
  id: '5243',
  name: 'item2',
  path: '5243',
  type: ITEM_TYPES.FOLDER,
  description: '',
  extra: extra,
});

const item3: RecordOf<Item> = makeItem({
  id: '5896',
  name: 'item3',
  path: '5896',
  type: ITEM_TYPES.FOLDER,
  description: '',
  extra: extra,
});

const item4: RecordOf<Item> = makeItem({
  id: 'dddd',
  name: 'item4',
  path: '5896.dddd',
  type: ITEM_TYPES.FOLDER,
  description: '',
  extra: extra,
});

const item5: RecordOf<Item> = makeItem({
  id: 'eeee',
  name: 'item5',
  path: '5896.eeee',
  type: ITEM_TYPES.FOLDER,
  description: '',
  extra: extra,
});

const item6: RecordOf<Item> = makeItem({
  id: 'gggg',
  name: 'item5',
  path: '5896.gggg',
  type: ITEM_TYPES.FOLDER,
  description: '',
  extra: extra,
});

export const ITEMS: List<RecordOf<Item>> = List([
  item1,
  item2,
  item3,
  item4,
  item5,
  item6,
]);

export const MESSAGE_IDS = ['12345', '78945'];

export const MEMBER_RESPONSE: Member = {
  id: '42',
  name: 'username',
  email: 'username@graasp.org',
  extra: {},
};

const recycleBinItemId = 'recycleBinId';
export const GET_RECYCLED_ITEMS_FIXTURES = {
  items: [
    {
      id: `${recycleBinItemId}.42`,
      name: 'item1',
      path: '42',
      type: ITEM_TYPES.FOLDER,
      description: '',
      extra: {},
    },
    {
      id: `${recycleBinItemId}.5243`,
      name: 'item2',
      path: '5243',
      type: ITEM_TYPES.FOLDER,
      description: '',
      extra: {},
    },
    {
      id: `${recycleBinItemId}.5896`,
      name: 'item3',
      path: '5896',
      type: ITEM_TYPES.FOLDER,
      description: '',
      extra: {},
    },
    {
      id: `${recycleBinItemId}.dddd`,
      name: 'item4',
      path: '5896.dddd',
      type: ITEM_TYPES.FOLDER,
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

export const MEMBERS_RESPONSE: Member[] = [
  MEMBER_RESPONSE,
  {
    id: '421',
    name: 'username1',
    email: 'username1@graasp.org',
    extra: {},
  },
];

export const OK_RESPONSE = {};

export const ITEM_MEMBERSHIPS_RESPONSE: Membership[] = [
  {
    id: 'membership-id',
    memberId: 'member-id',
    itemId: ITEMS.toArray()[0].id,
    permission: PERMISSION_LEVELS.READ,
  },
  {
    id: 'membership-id1',
    memberId: 'member-id1',
    itemId: ITEMS.toArray()[0].id,
    permission: PERMISSION_LEVELS.ADMIN,
  },
];

export const ITEM_LOGIN_RESPONSE: ItemLogin = {
  loginSchema: ITEM_LOGIN_SCHEMAS.USERNAME,
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
export const AVATAR_BLOB_RESPONSE = BlobMock;

export const APPS = [
  {
    name: 'Code App',
    url: 'http://codeapp.com',
    description: 'description',
    extra: {
      image: 'http://codeapp.com/logo.png',
    },
  },
  {
    name: 'File App',
    description: 'description',
    url: 'http://fileapp.com',
    extra: {
      image: 'http://fileapp.com/logo.png',
    },
  },
];

export const buildChatMessages = (id: UUID) => [
  { chatId: id, body: 'some text', creator: 'somememberid' },
  { chatId: id, body: 'some other text', creator: 'someothermemberid' },
];

export const FLAGS = [
  {
    id: 'flag-1-id',
    name: 'flag-1',
  },
  {
    id: 'flag-2-id',
    name: 'flag-2',
  },
];
export const TAGS = [
  {
    id: 'item-login-tag-id',
    name: 'item-login',
  },
  {
    id: 'item-public-tag-id',
    name: 'item-public',
  },
];

export const ITEM_TAGS = [
  {
    id: 'tag-id',
    path: 'somepath',
    tagId: 'tag-id',
  },
  {
    id: 'tag-id1',
    path: 'somepath1',
    tagId: 'tag-id1',
  },
];

export const ITEM_CHAT = {
  messages: [
    {
      id: MESSAGE_IDS[0],
      creator: MEMBER_RESPONSE.id,
      content: 'text',
    },
  ],
};

export const CATEGORY_TYPES = [
  {
    id: 'type-id',
    name: 'type-name',
  },
];

export const CATEGORIES = [
  {
    id: 'category-id1',
    name: 'category-name1',
    type: 'type-id1',
  },
  {
    id: 'category-id2',
    name: 'category-name2',
    type: 'type-id2',
  },
];

export const ITEM_CATEGORIES = [
  {
    id: 'id1',
    itemId: 'item-id',
    categoryId: 'category-id1',
  },
  {
    id: 'id2',
    itemId: 'item-id',
    categoryId: 'category-id2',
  },
];

export enum Ranges {
  All = 'all',
  Tag = 'tag',
  Title = 'title',
  Author = 'author',
}

export const ITEM_LIKES = [
  {
    id: 'id1',
    itemId: 'item-id',
    memberId: 'member-id',
    createdAt: 'timestamp',
  },
  {
    id: 'id2',
    itemId: 'item-id2',
    memberId: 'member-id',
    createdAt: 'timestamp',
  },
];

export const LIKE_COUNT = 100;

export const STATUS_LIST = [
  {
    id: 'id',
    name: 'status-1',
  },
  {
    id: 'id-2',
    name: 'status-2',
  },
];

export const ITEM_VALIDATION_STATUS: ItemValidationAndReview = {
  itemValidationId: 'iv-id-1',
  reviewStatusId: 'accepted',
  reviewReason: '',
  createdAt: 'ts',
};

export const FULL_VALIDATION_RECORDS = [
  {
    id: 'id-1',
    itemId: 'item-id-1',
    reviewStatusId: 'status-id-1',
    validationStatusId: 'status-id-2',
    validationResult: '',
    process: 'process-1',
    createdAt: 'ts',
  },
  {
    id: 'id-2',
    itemId: 'item-id-1',
    reviewStatusId: 'status-id-1',
    validationStatusId: 'status-id-2',
    validationResult: '',
    process: 'process-2',
    createdAt: 'ts',
  },
];

export const ITEM_VALIDATION_GROUPS = [
  {
    id: 'id-1',
    itemId: 'item-id-1',
    itemValidationId: 'iv-id',
    processId: 'ivp-id-1',
    statusId: 'success-id',
    result: '',
    updatedAt: 'ts',
    createdAt: '',
  },
  {
    id: 'id-2',
    itemId: 'item-id-1',
    itemValidationId: 'iv-id',
    processId: 'ivp-id-2',
    statusId: 'success-id',
    result: '',
    updatedAt: 'ts',
    createdAt: '',
  },
];

export const ACTIONS_DATA = {
  actions: [
    {
      id: 'action-id',
      itemId: 'item-id',
      memberId: 'member-id',
    },
  ],
};

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

export const buildMockInvitations = (itemId: string) => [
  buildInvitation({ itemPath: itemId, email: 'a' }),
  buildInvitation({ itemPath: itemId, email: 'b' }),
];

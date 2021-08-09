import {
  Item,
  ItemLogin,
  ITEM_TYPES,
  Member,
  Membership,
  PERMISSION_LEVELS,
} from '../src/types';

export const API_HOST = 'http://localhost:3000';
export const UNAUTHORIZED_RESPONSE = { some: 'error' };
export const ITEMS: Item[] = [
  {
    id: '42',
    name: 'item1',
    path: '42',
    type: ITEM_TYPES.FOLDER,
    description: '',
    extra: {},
  },
  {
    id: '5243',
    name: 'item2',
    path: '5243',
    type: ITEM_TYPES.FOLDER,
    description: '',
    extra: {},
  },
  {
    id: '5896',
    name: 'item3',
    path: '5896',
    type: ITEM_TYPES.FOLDER,
    description: '',
    extra: {},
  },
];

export const MEMBER_RESPONSE: Member = {
  id: '42',
  name: 'username',
  email: 'username@graasp.org',
  extra: {},
};

export const OK_RESPONSE = {};

export const ITEM_MEMBERSHIPS_RESPONSE: Membership[] = [
  {
    id: 'membership-id',
    memberId: 'member-id',
    itemId: 'item-id',
    permission: PERMISSION_LEVELS.READ,
  },
];

export const ITEM_LOGIN_RESPONSE: ItemLogin = {
  loginSchema: 'username',
};

const BlobMock = {
  blob: () => 'blob',
};

export const FILE_RESPONSE = BlobMock;

export const S3_FILE_RESPONSE = {
  key: 'someurl',
};
export const S3_FILE_BLOB_RESPONSE = BlobMock;

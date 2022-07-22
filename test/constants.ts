import { StatusCodes } from 'http-status-codes';
import { List, Record, RecordOf } from 'immutable';

import {
  Action,
  ActionData,
  ActionDataRecord,
  ActionRecord,
  App,
  AppRecord,
  Category,
  CategoryRecord,
  CategoryType,
  CategoryTypeRecord,
  ChatMention,
  ChatMessage,
  ChatMessageRecord,
  Flag,
  FlagRecord,
  FullValidationRecord,
  FullValidationRecordRecord,
  Invitation,
  InvitationRecord,
  Item,
  ItemCategory,
  ItemCategoryRecord,
  ItemLike,
  ItemLikeRecord,
  ItemLogin,
  ItemLoginRecord,
  ItemRecord,
  ItemTag,
  ItemTagRecord,
  ItemValidationAndReview,
  ItemValidationAndReviewRecord,
  ItemValidationGroup,
  ItemValidationGroupRecord,
  ITEM_LOGIN_SCHEMAS,
  ITEM_TYPES,
  Member,
  MemberExtra,
  MemberExtraRecord,
  MemberRecord,
  Membership,
  MembershipRecord,
  MessageItemChat,
  MessageItemChatList,
  MessageItemChatListRecord,
  MessageItemChatRecord,
  PERMISSION_LEVELS,
  Status,
  StatusRecord,
  Tag,
  TagRecord,
  UUID,
  ChatMentionRecord,
} from '../src/types';
import { REQUEST_METHODS } from '../src/api/utils';
import { v4 } from 'uuid';

export const WS_HOST = 'ws://localhost:3000';
export const API_HOST = 'http://localhost:3000';
export const DOMAIN = 'domain';
export const UNAUTHORIZED_RESPONSE = {
  name: 'unauthorized',
  code: 'ERRCODE',
  message: 'unauthorized error message',
  statusCode: StatusCodes.UNAUTHORIZED,
};

const defaultItemExtraValues: any = {};
const createItemExtra: Record.Factory<any> = Record(defaultItemExtraValues);
const extra: RecordOf<any> = createItemExtra({});

const defaultItemValues: Item = {
  id: '42',
  name: 'item1',
  path: '42',
  type: ITEM_TYPES.FOLDER,
  description: '',
  extra: extra,
};
const createMockItem: Record.Factory<Item> = Record(defaultItemValues);

const ITEM_1: ItemRecord = createMockItem({
  id: '42',
  name: 'item1',
  path: '42',
  type: ITEM_TYPES.FOLDER,
  description: '',
  extra: extra,
});

const ITEM_2: ItemRecord = createMockItem({
  id: '5243',
  name: 'item2',
  path: '5243',
  type: ITEM_TYPES.FOLDER,
  description: '',
  extra: extra,
});

const ITEM_3: ItemRecord = createMockItem({
  id: '5896',
  name: 'item3',
  path: '5896',
  type: ITEM_TYPES.FOLDER,
  description: '',
  extra: extra,
});

const ITEM_4: ItemRecord = createMockItem({
  id: 'dddd',
  name: 'item4',
  path: '5896.dddd',
  type: ITEM_TYPES.FOLDER,
  description: '',
  extra: extra,
});

const ITEM_5: ItemRecord = createMockItem({
  id: 'eeee',
  name: 'item5',
  path: '5896.eeee',
  type: ITEM_TYPES.FOLDER,
  description: '',
  extra: extra,
});

const ITEM_6: ItemRecord = createMockItem({
  id: 'gggg',
  name: 'item5',
  path: '5896.gggg',
  type: ITEM_TYPES.FOLDER,
  description: '',
  extra: extra,
});

export const ITEMS: List<ItemRecord> = List([
  ITEM_1,
  ITEM_2,
  ITEM_3,
  ITEM_4,
  ITEM_5,
  ITEM_6,
]);

export const MESSAGE_IDS = ['12345', '78945'];

const defaultMemberExtraValues: MemberExtra = {};
const createMemberExtra: Record.Factory<MemberExtra> = Record(
  defaultMemberExtraValues,
);
const extraMember: MemberExtraRecord = createMemberExtra({});

const defaultMemberValues: Member = {
  id: '42',
  name: 'username',
  email: 'username@graasp.org',
  extra: extraMember,
};
const createMockMember: Record.Factory<Member> = Record(defaultMemberValues);

export const MEMBER_RESPONSE: MemberRecord = createMockMember();

export const MENTION_IDS = ['12345', '78945'];

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

const MEMBER_RESPONSE_2: MemberRecord = createMockMember({
  id: '421',
  name: 'username1',
  email: 'username1@graasp.org',
  extra: extraMember,
});

export const MEMBERS_RESPONSE: List<MemberRecord> = List([
  MEMBER_RESPONSE,
  MEMBER_RESPONSE_2,
]);

export const OK_RESPONSE = {};

const defaultMembershipValues: Membership = {
  id: 'membership-id',
  memberId: 'member-id',
  itemId: ITEMS.toArray()[0].id,
  permission: PERMISSION_LEVELS.READ,
};
const createMockMembership: Record.Factory<Membership> = Record(
  defaultMembershipValues,
);

const MEMBERSHIP_1: MembershipRecord = createMockMembership({
  id: 'membership-id',
  memberId: 'member-id',
  itemId: ITEMS.toArray()[0].id,
  permission: PERMISSION_LEVELS.READ,
});

const MEMBERSHIP_2: MembershipRecord = createMockMembership({
  id: 'membership-id1',
  memberId: 'member-id1',
  itemId: ITEMS.toArray()[0].id,
  permission: PERMISSION_LEVELS.ADMIN,
});

export const ITEM_MEMBERSHIPS_RESPONSE: List<MembershipRecord> = List([
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
  method: REQUEST_METHODS,
  status?: string,
): ChatMention => {
  switch (method) {
    case REQUEST_METHODS.PATCH:
      return {
        ...mention,
        status: status || mention.status,
      };
    case REQUEST_METHODS.DELETE:
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
    chatId: id,
    body: 'some text',
    creator: 'somememberid',
  };
  const createMockChatMessage: Record.Factory<ChatMessage> = Record(
    defaultChatMessageValues,
  );
  const CHAT_MESSAGE_1: ChatMessageRecord = createMockChatMessage({
    chatId: id,
    body: 'some text',
    creator: 'somememberid',
  });
  const CHAT_MESSAGE_2: ChatMessageRecord = createMockChatMessage({
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

export const buildChatMention = ({
  id = v4(),
  memberId,
  status = 'unread',
}: {
  id?: UUID;
  memberId: UUID;
  status?: string;
}) => {
  const defaultChatMentionValues: ChatMention = {
    id: 'someid',
    itemPath: 'somepath',
    message: 'somemessage here',
    messageId: 'anotherid',
    createdAt: 'somedate',
    updatedAt: 'somedate',
    memberId: 'amemberid',
    status: 'unread',
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
  return {
    memberId,
    mentions: List([ CHAT_MENTION_1, CHAT_MENTION_2]),
  };
}


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

const defaultTagsValues: Tag = {
  id: 'item-login-tag-id',
  name: 'item-login',
};
const createMockTags: Record.Factory<Tag> = Record(defaultTagsValues);

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
  path: 'somepath',
  tagId: 'tag-id',
};
const createMockItemTags: Record.Factory<ItemTag> = Record(
  defaultItemTagsValues,
);

const ITEM_TAG_1: ItemTagRecord = createMockItemTags({
  id: 'tag-id',
  path: 'somepath',
  tagId: 'tag-id',
});

const ITEM_TAG_2: ItemTagRecord = createMockItemTags({
  id: 'tag-id1',
  path: 'somepath1',
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

const defaultItemLikesValues: ItemLike = {
  id: 'id1',
  itemId: 'item-id',
  memberId: 'member-id',
  createdAt: 'timestamp',
};
const createMockItemLike: Record.Factory<ItemLike> = Record(
  defaultItemLikesValues,
);

const ITEM_LIKE_1: ItemLikeRecord = createMockItemLike({
  id: 'id1',
  itemId: 'item-id',
  memberId: 'member-id',
  createdAt: 'timestamp',
});

const ITEM_LIKE_2: ItemLikeRecord = createMockItemLike({
  id: 'id2',
  itemId: 'item-id2',
  memberId: 'member-id',
  createdAt: 'timestamp',
});

export const ITEM_LIKES: List<ItemLikeRecord> = List([
  ITEM_LIKE_1,
  ITEM_LIKE_2,
]);

export const LIKE_COUNT = 100;

const defaultStatusValues: Status = {
  id: 'id',
  name: 'status-1',
};
const createMockStatus: Record.Factory<Status> = Record(defaultStatusValues);

const STATUS_1: StatusRecord = createMockStatus({
  id: 'id',
  name: 'status-1',
});

const STATUS_2: StatusRecord = createMockStatus({
  id: 'id-2',
  name: 'status-2',
});

export const STATUS_LIST: List<StatusRecord> = List([STATUS_1, STATUS_2]);

const defaultItemValidationStatusValues: ItemValidationAndReview = {
  itemValidationId: 'iv-id-1',
  reviewStatusId: 'accepted',
  reviewReason: '',
  createdAt: 'ts',
};
const createMockItemValidationSatus: Record.Factory<ItemValidationAndReview> =
  Record(defaultItemValidationStatusValues);

export const ITEM_VALIDATION_STATUS: ItemValidationAndReviewRecord =
  createMockItemValidationSatus({
    itemValidationId: 'iv-id-1',
    reviewStatusId: 'accepted',
    reviewReason: '',
    createdAt: 'ts',
  });

const defaultFullValidationValues: FullValidationRecord = {
  id: 'id-1',
  itemId: 'item-id-1',
  reviewStatusId: 'status-id-1',
  validationStatusId: 'status-id-2',
  validationResult: '',
  process: 'process-1',
  createdAt: 'ts',
};
const createMockFullValidation: Record.Factory<FullValidationRecord> = Record(
  defaultFullValidationValues,
);

const FULL_VALIDATION_RECORDS_1: FullValidationRecordRecord =
  createMockFullValidation({
    id: 'id-1',
    itemId: 'item-id-1',
    reviewStatusId: 'status-id-1',
    validationStatusId: 'status-id-2',
    validationResult: '',
    process: 'process-1',
    createdAt: 'ts',
  });

const FULL_VALIDATION_RECORDS_2: FullValidationRecordRecord =
  createMockFullValidation({
    id: 'id-2',
    itemId: 'item-id-1',
    reviewStatusId: 'status-id-1',
    validationStatusId: 'status-id-2',
    validationResult: '',
    process: 'process-2',
    createdAt: 'ts',
  });

export const FULL_VALIDATION_RECORDS: List<FullValidationRecordRecord> = List([
  FULL_VALIDATION_RECORDS_1,
  FULL_VALIDATION_RECORDS_2,
]);

const defaultItemValidationGroupValues: ItemValidationGroup = {
  id: 'id-1',
  itemId: 'item-id-1',
  itemValidationId: 'iv-id',
  processId: 'ivp-id-1',
  statusId: 'success-id',
  result: '',
  updatedAt: 'ts',
  createdAt: '',
};
const createMockItemValidationGroup: Record.Factory<ItemValidationGroup> =
  Record(defaultItemValidationGroupValues);

const ITEM_VALIDATION_GROUP_1: ItemValidationGroupRecord =
  createMockItemValidationGroup({
    id: 'id-1',
    itemId: 'item-id-1',
    itemValidationId: 'iv-id',
    processId: 'ivp-id-1',
    statusId: 'success-id',
    result: '',
    updatedAt: 'ts',
    createdAt: '',
  });

const ITEM_VALIDATION_GROUP_2: ItemValidationGroupRecord =
  createMockItemValidationGroup({
    id: 'id-2',
    itemId: 'item-id-1',
    itemValidationId: 'iv-id',
    processId: 'ivp-id-2',
    statusId: 'success-id',
    result: '',
    updatedAt: 'ts',
    createdAt: '',
  });

export const ITEM_VALIDATION_GROUPS: List<ItemValidationGroupRecord> = List([
  ITEM_VALIDATION_GROUP_1,
  ITEM_VALIDATION_GROUP_2,
]);

const defaultActionValues: Action = {
  id: 'action-id',
  itemId: 'item-id',
  memberId: 'member-id',
};
const createMockAction: Record.Factory<Action> = Record(defaultActionValues);

const ACTION_1: ActionRecord = createMockAction({
  id: 'action-id',
  itemId: 'item-id',
  memberId: 'member-id',
});

export const ACTIONS_LIST: List<ActionRecord> = List([ACTION_1]);

const defaultActionDataValues: ActionData = {
  actions: ACTIONS_LIST,
};

const createMockActionData: Record.Factory<ActionData> = Record(
  defaultActionDataValues,
);

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
  const defaultInvitationValues: Invitation = {
    id: 'id',
    name: name ?? 'member-name',
    email: email ?? 'email',
    creator: 'creator-id',
    itemPath,
  };
  const createMockInvitation: Record.Factory<Invitation> = Record(
    defaultInvitationValues,
  );
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

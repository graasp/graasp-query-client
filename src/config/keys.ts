import { UUID } from '@graasp/sdk';

import { OwnItemsQuery, SearchFields } from '../types';
import { AggregateActionsArgs } from '../utils/action';
import { hashItemsIds } from '../utils/item';
import { DEFAULT_THUMBNAIL_SIZE } from './constants';

export const APPS_KEY = 'apps';
export const ITEMS_KEY = 'items';
export const OWN_ITEMS_KEY = [ITEMS_KEY, 'own'];
export const buildOwnItemsKey = ({ page, name, all, limit }: OwnItemsQuery) => [
  ITEMS_KEY,
  'own',
  page,
  name,
  all,
  limit,
];
export const ETHERPADS_KEY = 'etherpads';
export const SUBSCRIPTION_KEY = 'subscriptions';

export const buildItemKey = (id?: UUID) => [ITEMS_KEY, id];
export const buildItemsKey = (ids: UUID[]) => [ITEMS_KEY, hashItemsIds(ids)];
export const buildItemChildrenKey = (id?: UUID) => [ITEMS_KEY, 'children', id];
export const buildItemPaginatedChildrenKey = (id?: UUID) => [
  ITEMS_KEY,
  'childrenPaginated',
  id,
];
export const buildItemsChildrenKey = (ids: UUID[]) => [
  ITEMS_KEY,
  'children',
  hashItemsIds(ids),
];
export const buildItemDescendantsKey = (id: UUID) => [
  ITEMS_KEY,
  'descendants',
  id,
];
export const SHARED_ITEMS_KEY = 'shared';
export const CURRENT_MEMBER_KEY = 'currentMember';
export const MEMBERS_KEY = 'members';
export const buildMemberKey = (id?: UUID) => [MEMBERS_KEY, id];
export const buildMembersKey = (ids: UUID[]) => [
  MEMBERS_KEY,
  hashItemsIds(ids),
];
export const buildItemParentsKey = (id?: UUID) => [ITEMS_KEY, 'parents', id];
export const CHATS_KEY = 'chats';
export const buildItemChatKey = (id: UUID) => [CHATS_KEY, id];
export const EXPORT_CHATS_KEY = 'exportChats';
export const buildExportItemChatKey = (id: UUID) => [EXPORT_CHATS_KEY, id];
export const MENTIONS_KEY = 'mentions';
export const buildMentionKey = () => [MENTIONS_KEY];

export const getKeyForParentId = (parentId?: UUID | null) =>
  parentId ? buildItemChildrenKey(parentId) : OWN_ITEMS_KEY;

export const buildItemMembershipsKey = (id?: UUID) => [
  ITEMS_KEY,
  'memberships',
  id,
];
export const buildManyItemMembershipsKey = (ids?: UUID[]) => [
  ITEMS_KEY,
  'memberships',
  hashItemsIds(ids),
];
export const buildItemLoginKey = (id?: UUID) => [ITEMS_KEY, 'login', id];
export const buildItemLoginSchemaKey = (id?: UUID) => [
  ITEMS_KEY,
  'loginSchema',
  id,
];
export const buildItemLoginSchemaTypeKey = (id?: UUID) => [
  ...buildItemLoginSchemaKey(id),
  'type',
];
export const TAGS_KEY = 'tags';
export const ITEM_TAGS_KEY = 'itemTags';
export const itemTagsKeys = {
  all: [ITEMS_KEY, ITEM_TAGS_KEY] as const,
  many: () => [...itemTagsKeys.all, 'many'] as const,
  single: () => [...itemTagsKeys.all, 'single'] as const,
  singleId: (id?: UUID) => [...itemTagsKeys.single(), id] as const,
  manyIds: (ids: UUID[] | undefined = []) =>
    [...itemTagsKeys.many(), ...ids] as const,
};
export const buildFileContentKey = ({
  id,
  replyUrl,
}: {
  id?: UUID;
  replyUrl?: boolean;
}) => [ITEMS_KEY, 'file', id, replyUrl ? 'url' : 'blob'];

export const ITEM_FLAGS_KEY = 'itemFlags';
export const buildItemFlagsKey = (id: UUID) => [ITEMS_KEY, 'flags', id];

export const CATEGORY_TYPES_KEY = 'categoryTypes';
export const buildCategoryKey = (id: UUID) => ['category', id];
export const buildCategoriesKey = (typeId?: UUID[]) => [
  'categories',
  hashItemsIds(typeId),
];
export const buildItemCategoriesKey = (id?: UUID) => [
  ITEMS_KEY,
  'categories',
  id,
];
export const buildItemsByCategoriesKey = (ids: UUID[]) => [
  'itemsInCategories',
  hashItemsIds(ids),
];

export const buildSearchByKeywordKey = (fields: SearchFields) => [
  'keywordSearch',
  fields,
];

export const RECYCLED_ITEMS_DATA_KEY = 'recycledItemsData';

export const FAVORITE_ITEMS_KEY = 'favoriteItems';

export const buildItemThumbnailKey = ({
  id,
  size = DEFAULT_THUMBNAIL_SIZE,
  replyUrl,
}: {
  id?: UUID;
  size?: string;
  replyUrl?: boolean;
}) => [ITEMS_KEY, id, 'thumbnails', size, replyUrl ? 'url' : 'blob'];
export const buildAvatarKey = ({
  id,
  replyUrl,
  size = DEFAULT_THUMBNAIL_SIZE,
}: {
  id?: UUID;
  size?: string;
  replyUrl: boolean;
}) => [MEMBERS_KEY, id, 'avatars', size, replyUrl ? 'url' : 'blob'];

export const buildGetLikesForMemberKey = (id?: UUID) => [
  MEMBERS_KEY,
  'likedItems',
  id,
];
export const buildGetLikesForItem = (id?: UUID) => [ITEMS_KEY, 'likes', id];
export const buildGetMostLikedPublishedItems = (limit?: number) => [
  ITEMS_KEY,
  'collections',
  'liked',
  limit,
];
export const buildGetMostRecentPublishedItems = (limit?: number) => [
  ITEMS_KEY,
  'collections',
  'recent',
  limit,
];

export const buildPublishedItemsKey = (categoryIds?: UUID[]) => [
  ITEMS_KEY,
  'collections',
  hashItemsIds(categoryIds),
];
export const buildPublishedItemsForMemberKey = (memberId?: UUID) => [
  ITEMS_KEY,
  'collections',
  MEMBERS_KEY,
  memberId,
];

export const buildItemPublishedInformationKey = (id: UUID) => [
  ITEMS_KEY,
  'publishedInformation',
  id,
];

export const buildManyItemPublishedInformationsKey = (ids: UUID[]) => [
  ITEMS_KEY,
  'publishedInformation',
  ids,
];

export const buildLastItemValidationGroupKey = (id: UUID) => [
  ITEMS_KEY,
  'itemValidation',
  'latest',
  id,
];

export const buildItemValidationAndReviewKey = (id: UUID) => [
  ITEMS_KEY,
  'itemValidationAndReview',
  id,
];
export const buildItemValidationGroupsKey = (id: UUID) => [
  ITEMS_KEY,
  'itemValidationGroups',
  id,
];

export const buildActionsKey = (args: {
  itemId?: UUID;
  view: string;
  requestedSampleSize: number;
}) => [
  'actions',
  args.itemId,
  {
    view: args.view,
    size: args.requestedSampleSize,
  },
];

export const buildAggregateActionsKey = (
  args: Omit<AggregateActionsArgs, 'itemId'> &
    Partial<Pick<AggregateActionsArgs, 'itemId'>>,
) => ['aggregateActions', args];

export const buildInvitationKey = (id?: UUID) => ['invitations', id];
export const buildItemInvitationsKey = (id?: UUID) => [
  ITEMS_KEY,
  id,
  'invitations',
];

export const PLANS_KEY = [SUBSCRIPTION_KEY, 'plans'];
export const OWN_PLAN_KEY = [SUBSCRIPTION_KEY, 'ownPlan'];
export const CARDS_KEY = [SUBSCRIPTION_KEY, 'cards'];
export const buildPlanKey = (id: string) => [
  MEMBERS_KEY,
  SUBSCRIPTION_KEY,
  'plans',
  id,
];
export const buildPlansKey = (id: string) => [
  MEMBERS_KEY,
  SUBSCRIPTION_KEY,
  'plans',
  id,
];
export const CURRENT_CUSTOMER_KEY = [SUBSCRIPTION_KEY, 'currentCustomer'];

export const buildEtherpadKey = (itemId?: UUID) => [ETHERPADS_KEY, itemId];

export const DATA_KEYS = {
  APPS_KEY,
  ITEMS_KEY,
  OWN_ITEMS_KEY,
  buildItemKey,
  buildItemsKey,
  buildItemChildrenKey,
  buildItemsChildrenKey,
  SHARED_ITEMS_KEY,
  CURRENT_MEMBER_KEY,
  MEMBERS_KEY,
  buildMemberKey,
  buildMembersKey,
  buildItemParentsKey,
  CHATS_KEY,
  buildItemChatKey,
  buildMentionKey,
  getKeyForParentId,
  buildItemMembershipsKey,
  buildManyItemMembershipsKey,
  buildItemLoginKey,
  TAGS_KEY,
  ITEM_TAGS_KEY,
  itemTagsKeys,
  buildFileContentKey,
  ITEM_FLAGS_KEY,
  buildItemFlagsKey,
  CATEGORY_TYPES_KEY,
  buildCategoryKey,
  buildCategoriesKey,
  buildItemCategoriesKey,
  buildItemsByCategoriesKey,
  buildSearchByKeywordKey,
  RECYCLED_ITEMS_DATA_KEY,
  FAVORITE_ITEMS_KEY,
  buildItemThumbnailKey,
  buildAvatarKey,
  buildGetLikesForMemberKey,
  buildGetLikesForItem,
  buildItemValidationAndReviewKey,
  buildItemValidationGroupsKey,
  buildLastItemValidationGroupKey,
  buildInvitationKey,
  buildItemInvitationsKey,
  CARDS_KEY,
  buildPlanKey,
  buildPublishedItemsKey,
  buildEtherpadKey,
  buildOwnItemsKey,
};

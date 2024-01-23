import { AggregateBy, Category, UUID } from '@graasp/sdk';

import { ItemSearchParams } from '../api/routes';
import { PaginationParams } from '../types';
import { AggregateActionsArgs } from '../utils/action';
import { hashItemsIds } from '../utils/item';
import { DEFAULT_THUMBNAIL_SIZE } from './constants';

const ITEMS_CONTEXT = 'items';

export const APPS_KEY = ['apps'];
export const SHORT_LINKS_KEY = 'shortLinks';
export const OWN_ITEMS_KEY = [ITEMS_CONTEXT, 'own'];
const ETHERPADS_CONTEXT = 'etherpads';
const SUBSCRIPTION_CONTEXT = 'subscriptions';

export const buildShortLinkKey = (alias: string | undefined) => [
  SHORT_LINKS_KEY,
  alias,
];
export const buildShortLinksItemKey = (id: UUID) => [
  SHORT_LINKS_KEY,
  ITEMS_CONTEXT,
  id,
];
export const buildItemKey = (id?: UUID) => [ITEMS_CONTEXT, id];
export const buildItemsKey = (ids: UUID[]) => [
  ITEMS_CONTEXT,
  hashItemsIds(ids),
];
export const buildItemChildrenKey = (id?: UUID) => [
  ITEMS_CONTEXT,
  'children',
  id,
];
export const buildItemPaginatedChildrenKey = (id?: UUID) => [
  ITEMS_CONTEXT,
  'childrenPaginated',
  id,
];
export const buildItemsChildrenKey = (ids: UUID[]) => [
  ITEMS_CONTEXT,
  'children',
  hashItemsIds(ids),
];
export const buildItemDescendantsKey = (id: UUID) => [
  ITEMS_CONTEXT,
  'descendants',
  id,
];

export const accessibleItemsKeys = {
  all: [ITEMS_CONTEXT, 'accessible'] as const,
  singlePage: (params: ItemSearchParams, pagination: PaginationParams) =>
    [...accessibleItemsKeys.all, params, pagination] as const,
};
export const SHARED_ITEMS_KEY = ['shared'];
export const CURRENT_MEMBER_KEY = ['currentMember'];
const MEMBERS_CONTEXT = 'members';
export const buildMemberKey = (id?: UUID) => [MEMBERS_CONTEXT, id];
export const buildMembersKey = (ids: UUID[]) => [
  MEMBERS_CONTEXT,
  hashItemsIds(ids),
];
export const buildItemParentsKey = (id?: UUID) => [
  ITEMS_CONTEXT,
  'parents',
  id,
];
const CHATS_CONTEXT = 'chats';
export const buildItemChatKey = (id: UUID) => [CHATS_CONTEXT, id];
const MENTIONS_CONTEXT = 'mentions';
export const buildMentionKey = () => [MENTIONS_CONTEXT];

export const getKeyForParentId = (parentId?: UUID | null) =>
  parentId ? buildItemChildrenKey(parentId) : accessibleItemsKeys.all;

export const buildItemMembershipsKey = (id?: UUID) => [
  ITEMS_CONTEXT,
  'memberships',
  id,
];
export const buildManyItemMembershipsKey = (ids?: UUID[]) => [
  ITEMS_CONTEXT,
  'memberships',
  hashItemsIds(ids),
];
export const buildItemLoginKey = (id?: UUID) => [ITEMS_CONTEXT, 'login', id];
export const buildItemLoginSchemaKey = (id?: UUID) => [
  ITEMS_CONTEXT,
  'loginSchema',
  id,
];
export const buildItemLoginSchemaTypeKey = (id?: UUID) => [
  ...buildItemLoginSchemaKey(id),
  'type',
];
const ITEM_TAGS_CONTEXT = 'itemTags';
export const itemTagsKeys = {
  all: [ITEMS_CONTEXT, ITEM_TAGS_CONTEXT] as const,
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
}) => [ITEMS_CONTEXT, 'file', id, replyUrl ? 'url' : 'blob'];

export const ITEM_FLAGS_CONTEXT = 'itemFlags';
export const buildItemFlagsKey = (id: UUID) => [ITEMS_CONTEXT, 'flags', id];

export const buildCategoryKey = (id: UUID) => ['category', id];
export const buildCategoriesKey = (typeId?: UUID[]) => [
  'categories',
  hashItemsIds(typeId),
];
export const buildItemCategoriesKey = (id?: UUID) => [
  ITEMS_CONTEXT,
  'categories',
  id,
];
export const buildItemsByCategoriesKey = (ids: UUID[]) => [
  'itemsInCategories',
  hashItemsIds(ids),
];

export const RECYCLED_ITEMS_KEY = 'recycledItems';
export const RECYCLED_ITEMS_DATA_KEY = ['recycledItemsData'];

export const FAVORITE_ITEMS_KEY = ['favoriteItems'];

export const buildItemThumbnailKey = ({
  id,
  size = DEFAULT_THUMBNAIL_SIZE,
  replyUrl,
}: {
  id?: UUID;
  size?: string;
  replyUrl?: boolean;
}) => [ITEMS_CONTEXT, id, 'thumbnails', size, replyUrl ? 'url' : 'blob'];
export const buildAvatarKey = ({
  id,
  replyUrl,
  size = DEFAULT_THUMBNAIL_SIZE,
}: {
  id?: UUID;
  size?: string;
  replyUrl: boolean;
}) => [MEMBERS_CONTEXT, id, 'avatars', size, replyUrl ? 'url' : 'blob'];

export const buildGetLikesForMemberKey = (id?: UUID) => [
  MEMBERS_CONTEXT,
  'likedItems',
  id,
];
export const buildGetLikesForItem = (id?: UUID) => [ITEMS_CONTEXT, 'likes', id];
export const buildGetMostLikedPublishedItems = (limit?: number) => [
  ITEMS_CONTEXT,
  'collections',
  'liked',
  limit,
];
export const buildGetMostRecentPublishedItems = (limit?: number) => [
  ITEMS_CONTEXT,
  'collections',
  'recent',
  limit,
];

export const buildPublishedItemsKey = (categoryIds?: UUID[]) => [
  ITEMS_CONTEXT,
  'collections',
  hashItemsIds(categoryIds),
];
export const buildPublishedItemsForMemberKey = (memberId?: UUID) => [
  ITEMS_CONTEXT,
  'collections',
  MEMBERS_CONTEXT,
  memberId,
];

export const buildItemPublishedInformationKey = (id: UUID) => [
  ITEMS_CONTEXT,
  'publishedInformation',
  id,
];

export const buildManyItemPublishedInformationsKey = (ids: UUID[]) => [
  ITEMS_CONTEXT,
  'publishedInformation',
  ids,
];

export const buildLastItemValidationGroupKey = (id: UUID) => [
  ITEMS_CONTEXT,
  'itemValidation',
  'latest',
  id,
];

export const buildItemValidationAndReviewKey = (id: UUID) => [
  ITEMS_CONTEXT,
  'itemValidationAndReview',
  id,
];
export const buildItemValidationGroupsKey = (id: UUID) => [
  ITEMS_CONTEXT,
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

export const buildAggregateActionsKey = <K extends AggregateBy[]>(
  itemId: string | undefined,
  args: Omit<AggregateActionsArgs<K>, 'itemId'>,
) => ['aggregateActions', itemId, args];

export const buildInvitationKey = (id?: UUID) => ['invitations', id];
export const buildItemInvitationsKey = (id?: UUID) => [
  ITEMS_CONTEXT,
  id,
  'invitations',
];

export const PLANS_KEY = [SUBSCRIPTION_CONTEXT, 'plans'];
export const OWN_PLAN_KEY = [SUBSCRIPTION_CONTEXT, 'ownPlan'];
export const CARDS_KEY = [SUBSCRIPTION_CONTEXT, 'cards'];
export const buildPlanKey = (id: string) => [
  MEMBERS_CONTEXT,
  SUBSCRIPTION_CONTEXT,
  'plans',
  id,
];
export const buildPlansKey = (id: string) => [
  MEMBERS_CONTEXT,
  SUBSCRIPTION_CONTEXT,
  'plans',
  id,
];
export const CURRENT_CUSTOMER_KEY = [SUBSCRIPTION_CONTEXT, 'currentCustomer'];

export const buildEtherpadKey = (itemId?: UUID) => [ETHERPADS_CONTEXT, itemId];

export const buildSearchPublishedItemsKey = (args: {
  query?: string;
  categories?: Category['id'][][];
  isPublishedRoot?: boolean;
  limit?: number;
  offset?: number;
  sort?: string[];
  highlightPreTag?: string;
  highlightPostTag?: string;
  page?: number;
}) => [ITEMS_CONTEXT, 'search', { isPublishedRoot: false, ...args }];

export const CURRENT_MEMBER_STORAGE_KEY = [
  MEMBERS_CONTEXT,
  'current',
  'storage',
];

export const OWN_PUBLIC_PROFILE_KEY = ['own-profile'];
export const buildPublicProfileKey = (memberId: UUID) => ['profile', memberId];

export const buildItemsInMapKeys = {
  all: [ITEMS_CONTEXT, 'map'],
  single: ({
    lat1,
    lat2,
    lng1,
    lng2,
  }: {
    lat1: number;
    lat2: number;
    lng1: number;
    lng2: number;
  }) => [...buildItemsInMapKeys.all, { lat1, lat2, lng1, lng2 }],
};

export const buildItemGeolocationKey = (itemId?: UUID) => [
  ITEMS_CONTEXT,
  itemId,
  'geolocation',
];

export const DATA_KEYS = {
  APPS_KEY,
  buildItemKey,
  buildItemsKey,
  buildItemChildrenKey,
  buildItemsChildrenKey,
  CURRENT_MEMBER_KEY,
  buildMemberKey,
  buildMembersKey,
  buildItemParentsKey,
  buildItemChatKey,
  buildMentionKey,
  getKeyForParentId,
  buildItemMembershipsKey,
  buildManyItemMembershipsKey,
  buildItemLoginKey,
  itemTagsKeys,
  buildFileContentKey,
  buildItemFlagsKey,
  buildCategoryKey,
  buildCategoriesKey,
  buildItemCategoriesKey,
  buildItemsByCategoriesKey,
  RECYCLED_ITEMS_DATA_KEY,
  buildItemThumbnailKey,
  CURRENT_MEMBER_STORAGE_KEY,
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
  buildSearchPublishedItemsKey,
  OWN_PUBLIC_PROFILE_KEY,
  buildPublicProfileKey,
  buildItemsInMapKeys,
  buildItemGeolocationKey,
};

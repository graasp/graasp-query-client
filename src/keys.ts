import {
  AggregateBy,
  DiscriminatedItem,
  ItemGeolocation,
  ItemType,
  ItemTypeUnion,
  Pagination,
  Tag,
  TagCategory,
  UUID,
  UnionOfConst,
} from '@graasp/sdk';
import { DEFAULT_LANG } from '@graasp/translations';

import { MeiliSearchProps } from './api/search.js';
import { DEFAULT_THUMBNAIL_SIZE } from './config/constants.js';
import { ItemSearchParams } from './item/types.js';
import { AggregateActionsArgs } from './utils/action.js';

/**
 * Contexts
 */
const ITEMS_CONTEXT = 'items';
const CHATS_CONTEXT = 'chats';
const SHORT_LINKS_CONTEXT = 'shortLinks';
const SUBSCRIPTION_CONTEXT = 'subscriptions';

export const APPS_KEY = ['apps'];

export const buildShortLinkKey = (alias: string | undefined) => [
  SHORT_LINKS_CONTEXT,
  alias,
];

export const itemKeys = {
  all: [ITEMS_CONTEXT] as const,

  // all single item queries
  allSingles: () => [...itemKeys.all, 'one'] as const,

  // keys for a single item
  single: (id?: UUID) => {
    const singleBaseKey = [...itemKeys.allSingles(), id] as const;
    const allChildren = [...singleBaseKey, 'children'] as const;
    const itemLoginSchema = [...singleBaseKey, 'loginSchema'] as const;
    const allThumbnails = [...singleBaseKey, 'thumbnails'] as const;

    return {
      // data for one item
      content: [...singleBaseKey] as const,

      // all children queries for single items
      allChildren,

      // itemKeys.single(id).children([one, two])
      children: ({
        ordered,
        types = [],
        keywords,
      }: {
        ordered?: boolean;
        types?: UnionOfConst<typeof ItemType>[];
        keywords?: string;
      } = {}) => [...allChildren, { ordered, types, keywords }] as const,

      // todo: add page and filtering options
      // this is used in the infinite query for the player
      // we might change it in a future refactor
      paginatedChildren: [...allChildren, 'paginated'] as const,

      // descendants
      descendants: (options?: {
        types?: ItemTypeUnion[];
        showHidden?: boolean;
      }) => [...singleBaseKey, 'descendants', options].filter(Boolean),

      // parents
      parents: [...singleBaseKey, 'parents'] as const,

      // item login
      itemLoginSchema: {
        content: [...itemLoginSchema] as const,
        type: [...itemLoginSchema, 'type'] as const,
      },

      // thumbnails
      allThumbnails,
      thumbnail: (options: { size?: string; replyUrl?: boolean }) =>
        [
          ...allThumbnails,
          options.size ?? DEFAULT_THUMBNAIL_SIZE,
          options.replyUrl ? 'url' : 'blob',
        ] as const,

      visibilities: [...singleBaseKey, 'visibilities'] as const,

      flags: [...singleBaseKey, 'flags'] as const,

      file: (options?: { replyUrl?: boolean }) =>
        [...singleBaseKey, 'file', options] as const,

      // etherpad
      etherpad: [...singleBaseKey, 'etherpad'] as const,

      // geolocation
      geolocation: [...singleBaseKey, 'geolocation'] as const,

      // short links
      shortLinks: [...singleBaseKey, 'shortLinks'] as const,

      // likes
      likes: [...singleBaseKey, 'likes'] as const,

      // published info
      publishedInformation: [...singleBaseKey, 'publishedInformation'] as const,

      validation: [...singleBaseKey, 'validation'] as const,

      invitation: [...singleBaseKey, 'invitation'] as const,

      memberships: [...singleBaseKey, 'memberships'] as const,

      publicationStatus: [...singleBaseKey, 'publication', 'status'] as const,

      tags: [...singleBaseKey, 'tags'] as const,
    };
  },

  // many items
  allMany: () => [...itemKeys.all, 'many'] as const,
  many: (ids?: UUID[]) => {
    const manyBaseKey = [...itemKeys.allMany(), ids] as const;
    return {
      // data for the items requested
      content: [...manyBaseKey, 'content'],
    };
  },

  // accessible items
  allAccessible: () => [...itemKeys.all, 'accessible'] as const,
  infiniteAccessible: (params: ItemSearchParams) =>
    [...itemKeys.allAccessible(), 'infinite', params] as const,
  accessiblePage: (params: ItemSearchParams, pagination: Partial<Pagination>) =>
    [...itemKeys.allAccessible(), params, pagination] as const,

  search: (args: {
    query?: string;
    tags?: { [key in TagCategory]: Tag['name'][] };
    isPublishedRoot?: boolean;
    limit?: number;
    offset?: number;
    sort?: string[];
    highlightPreTag?: string;
    highlightPostTag?: string;
    page?: number;
    langs?: string[];
  }) =>
    [...itemKeys.all, 'search', { isPublishedRoot: false, ...args }] as const,

  published: () => {
    const publishedBaseKey = [...itemKeys.all, 'collections'] as const;

    return {
      all: [...publishedBaseKey] as const,

      // for categories
      forCategories: (categoryIds?: UUID[]) =>
        [...publishedBaseKey, { categoryIds }] as const,

      // most liked collections
      mostLiked: (limit?: number) =>
        [...publishedBaseKey, 'mostLiked', limit] as const,

      // most liked collections
      mostRecent: (limit?: number) =>
        [...publishedBaseKey, 'mostRecent', limit] as const,

      // for member
      byMember: (memberId?: UUID) =>
        [...publishedBaseKey, 'member', memberId] as const,
    };
  },

  categories: (categories?: UUID[]) => [...itemKeys.all, { categories }],
};

export const memberKeys = {
  all: ['members'] as const,

  // a single member
  single: (id?: UUID) => {
    const singleBaseKey = [...memberKeys.all, id] as const;
    const allAvatars = [...singleBaseKey, 'avatar'] as const;
    const allSubscriptions = [...singleBaseKey, 'subscription'] as const;
    return {
      // data of the member in question
      content: [...singleBaseKey] as const,

      // avatar picture
      allAvatars,
      avatar: (options: { size?: string; replyUrl?: boolean }) =>
        [...allAvatars, { size: DEFAULT_THUMBNAIL_SIZE, ...options }] as const,

      // profile data
      profile: [...singleBaseKey, 'profile'] as const,

      // items liked by the member
      likedItems: [...singleBaseKey, 'likedItems'] as const,

      // subscription plan for the member
      allSubscriptions,
      subscription: (planId: string) => [...allSubscriptions, planId] as const,
    };
  },

  // many members
  many: (ids?: UUID[]) => [...memberKeys.all, ids] as const,

  // the current member
  current: () => {
    const currentBaseKey = [...memberKeys.all, 'current'] as const;
    return {
      // data for the current member
      content: [...currentBaseKey] as const,

      // items liked by the current member
      // todo: should this be in the items keys instead ?
      likedItems: [...currentBaseKey, 'likedItems'] as const,

      /**
        Bookmarked items
      */
      bookmarkedItems: [...currentBaseKey, 'bookmarkedItems'] as const,

      /**
        This should hold RecycledItemData
      */
      allRecycled: [...currentBaseKey, 'recycled'] as const,
      infiniteRecycledItemData: () =>
        [...memberKeys.current().allRecycled, 'infinite'] as const,

      // current member storage usage
      storage: [...currentBaseKey, 'storage'] as const,

      // storage files
      storageFiles: (pagination: Partial<Pagination>) =>
        [...currentBaseKey, 'storage', 'files', pagination] as const,

      // current member profile (can be non-public)
      profile: [...currentBaseKey, 'profile'] as const,

      // subscription plan for the current member
      subscription: [...currentBaseKey, 'subscription'] as const,

      // actions for current member
      actions: (args: { startDate?: string; endDate?: string }) => [
        ...currentBaseKey,
        'actions',
        {
          startDate: args.startDate,
          endDate: args.endDate,
        },
      ],
      // apps used mostly by the member
      mostUsedApps: [...currentBaseKey, 'mostUsedApps'] as const,

      // password status
      passwordStatus: [...currentBaseKey, 'passwordStatus'],
    };
  },
};

export const buildItemChatKey = (id: UUID) => [CHATS_CONTEXT, id];
const MENTIONS_CONTEXT = 'mentions';
export const buildMentionKey = () => [MENTIONS_CONTEXT];

export const getKeyForParentId = (parentId?: UUID | null) =>
  parentId ? itemKeys.single(parentId).allChildren : itemKeys.allAccessible();

export const buildManyItemMembershipsKey = (ids?: UUID[]) => [
  ITEMS_CONTEXT,
  'memberships',
  ids,
];

export const categoryKeys = {
  all: ['category'] as const,
  single: (id?: UUID) => [...categoryKeys.all, id] as const,
  many: (ids?: UUID[]) => [...categoryKeys.all, ids] as const,
};

export const buildActionsKey = (args: {
  itemId?: UUID;
  view: string;
  requestedSampleSize: number;
  startDate: string;
  endDate: string;
}) => [
  'actions',
  args.itemId,
  {
    view: args.view,
    size: args.requestedSampleSize,
    startDate: args.startDate,
    endDate: args.endDate,
  },
];

export const buildAggregateActionsKey = <K extends AggregateBy[]>(
  itemId: string | undefined,
  args: Omit<AggregateActionsArgs<K>, 'itemId'>,
) => ['aggregateActions', itemId, args];

export const buildInvitationKey = (id?: UUID) => ['invitations', id];

export const PLANS_KEY = [SUBSCRIPTION_CONTEXT, 'plans'];
export const CARDS_KEY = [SUBSCRIPTION_CONTEXT, 'cards'];

export const CURRENT_CUSTOMER_KEY = [SUBSCRIPTION_CONTEXT, 'currentCustomer'];

export const itemsWithGeolocationKeys = {
  allBounds: [ITEMS_CONTEXT, 'map'],
  inBounds: ({
    lat1,
    lat2,
    lng1,
    lng2,
    parentItemId,
    keywords,
  }: {
    keywords?: string[];
    lat1?: ItemGeolocation['lat'];
    lat2?: ItemGeolocation['lat'];
    lng1?: ItemGeolocation['lng'];
    lng2?: ItemGeolocation['lng'];
    parentItemId?: DiscriminatedItem['id'];
  }) => [
    ...itemsWithGeolocationKeys.allBounds,
    { lat1, lat2, lng1, lng2, parentItemId, keywords },
  ],
};

export const buildAddressFromCoordinatesKey = (
  payload: Pick<ItemGeolocation, 'lat' | 'lng'> | undefined,
) => ['address', payload];

export const buildSuggestionsForAddressKey = ({
  address,
  lang = DEFAULT_LANG,
}: {
  address?: string;
  lang?: string;
}) => ['address', { address, lang }];

export const buildEmbeddedLinkMetadataKey = (link: string) => [
  'embedded-links',
  'metadata',
  link,
];

export const buildFacetKey = (
  args: {
    facetName?: string;
  } & MeiliSearchProps,
) => ['facets', args.facetName, args];

export const DATA_KEYS = {
  APPS_KEY,
  itemKeys,
  buildItemChatKey,
  buildMentionKey,
  getKeyForParentId,
  buildManyItemMembershipsKey,
  buildInvitationKey,
  CARDS_KEY,
  itemsWithGeolocationKeys,
  buildAddressFromCoordinatesKey,
  buildSuggestionsForAddressKey,
};

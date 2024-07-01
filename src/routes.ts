import {
  AggregateBy,
  DiscriminatedItem,
  ExportActionsFormatting,
  ItemGeolocation,
  ItemTag,
  ItemTagType,
  UUID,
} from '@graasp/sdk';
import { DEFAULT_LANG } from '@graasp/translations';

import qs from 'qs';

import * as itemRoutes from './item/routes.js';
import * as memberRoutes from './member/routes.js';
import { AggregateActionsArgs } from './utils/action.js';

export const APPS_ROUTE = 'app-items';
export const ITEMS_ROUTE = 'items';
export const ITEM_MEMBERSHIPS_ROUTE = 'item-memberships';
export const INVITATIONS_ROUTE = `invitations`;
export const GET_BOOKMARKED_ITEMS_ROUTE = `${ITEMS_ROUTE}/favorite`;
export const CATEGORIES_ROUTE = `${ITEMS_ROUTE}/categories`;
export const ETHERPAD_ROUTE = `${ITEMS_ROUTE}/etherpad`;
export const COLLECTIONS_ROUTE = `collections`;
export const buildAppListRoute = `${APPS_ROUTE}/list`;
export const buildMostUsedAppListRoute = `${APPS_ROUTE}/most-used`;
export const SHORT_LINKS_ROUTE = `${ITEMS_ROUTE}/short-links`;
export const SHORT_LINKS_LIST_ROUTE = `${SHORT_LINKS_ROUTE}/list`;
export const EMBEDDED_LINKS_ROUTE = `${ITEMS_ROUTE}/embedded-links/metadata`;

export const buildExportItemRoute = (id: UUID) =>
  `${ITEMS_ROUTE}/zip-export/${id}`;
export const buildPostItemMembershipRoute = (id: UUID) =>
  `item-memberships?itemId=${id}`;
export const buildPostManyItemMembershipsRoute = (id: UUID) =>
  `item-memberships/${id}`;
export const buildInviteRoute = (id: UUID) => `invite/${id}`;
export const buildGetItemMembershipsForItemsRoute = (ids: UUID[]) =>
  `item-memberships${qs.stringify(
    { itemId: ids },
    {
      addQueryPrefix: true,
      arrayFormat: 'repeat',
    },
  )}`;
export const buildGetItemInvitationsForItemRoute = (id: UUID) =>
  `${ITEMS_ROUTE}/${id}/invitations`;
export const buildPostUserCSVUploadRoute = (id: UUID) =>
  `${ITEMS_ROUTE}/${id}/invitations/upload-csv`;

export const buildGetItemChatRoute = (id: UUID) => `${ITEMS_ROUTE}/${id}/chat`;
export const buildExportItemChatRoute = (id: UUID) =>
  `${ITEMS_ROUTE}/${id}/export/chat`;
export const buildPostItemChatMessageRoute = (id: UUID) =>
  `${ITEMS_ROUTE}/${id}/chat`;
export const buildPatchItemChatMessageRoute = (chatId: UUID, messageId: UUID) =>
  `${ITEMS_ROUTE}/${chatId}/chat/${messageId}`;
export const buildDeleteItemChatMessageRoute = (
  chatId: UUID,
  messageId: UUID,
) => `${ITEMS_ROUTE}/${chatId}/chat/${messageId}`;
export const buildClearItemChatRoute = (id: UUID) =>
  `${ITEMS_ROUTE}/${id}/chat`;

export const buildGetMemberMentionsRoute = () => `${ITEMS_ROUTE}/mentions`;
export const buildPatchMentionRoute = (id: UUID) =>
  `${ITEMS_ROUTE}/mentions/${id}`;
export const buildDeleteMentionRoute = (id: UUID) =>
  `${ITEMS_ROUTE}/mentions/${id}`;
export const buildClearMentionsRoute = () => `${ITEMS_ROUTE}/mentions`;

export const buildImportZipRoute = (parentId?: UUID, previousItemId?: UUID) =>
  `${ITEMS_ROUTE}/zip-import${qs.stringify(
    { parentId, previousItemId },
    { addQueryPrefix: true },
  )}`;
export const buildImportH5PRoute = (parentId?: UUID, previousItemId?: UUID) =>
  `${ITEMS_ROUTE}/h5p-import${qs.stringify(
    { parentId, previousItemId },
    { addQueryPrefix: true },
  )}`;

export const MOBILE_SIGN_UP_ROUTE = `m/register`;
export const MOBILE_SIGN_IN_ROUTE = `m/login`;
export const MOBILE_SIGN_IN_WITH_PASSWORD_ROUTE = `m/login-password`;
export const SIGN_IN_ROUTE = `login`;
export const SIGN_IN_WITH_PASSWORD_ROUTE = `login-password`;
export const SIGN_UP_ROUTE = `register`;
export const SIGN_OUT_ROUTE = 'logout';
export const buildGetItemTagsRoute = (id: UUID) => `${ITEMS_ROUTE}/${id}/tags`;
export const buildGetItemsTagsRoute = (ids: UUID[]) =>
  `${ITEMS_ROUTE}/tags?${qs.stringify({ id: ids }, { arrayFormat: 'repeat' })}`;
export const buildPostItemTagRoute = ({
  itemId,
  type,
}: {
  itemId: UUID;
  type: ItemTagType;
}) => `${ITEMS_ROUTE}/${itemId}/tags/${type}`;
export const buildPutItemLoginSchemaRoute = (id: UUID) =>
  `${ITEMS_ROUTE}/${id}/login-schema`;
export const buildGetItemLoginSchemaRoute = (id: UUID) =>
  `${ITEMS_ROUTE}/${id}/login-schema`;
export const buildGetItemLoginSchemaTypeRoute = (id: UUID) =>
  `${ITEMS_ROUTE}/${id}/login-schema-type`;
export const buildDeleteItemTagRoute = ({
  itemId,
  type,
}: {
  itemId: DiscriminatedItem['id'];
  type: ItemTag['type'];
}) => `${ITEMS_ROUTE}/${itemId}/tags/${type}`;
export const buildPostItemLoginSignInRoute = (id: UUID) =>
  `${ITEMS_ROUTE}/${id}/login`;
export const GET_TAGS_ROUTE = `${ITEMS_ROUTE}/tags/list`;
export const buildDeleteItemLoginSchemaRoute = (id: UUID) =>
  `${ITEMS_ROUTE}/${id}/login-schema`;
export const buildEditItemMembershipRoute = (id: UUID) =>
  `${ITEM_MEMBERSHIPS_ROUTE}/${id}`;
export const buildDeleteItemMembershipRoute = (id: UUID) =>
  `${ITEM_MEMBERSHIPS_ROUTE}/${id}`;

export const GET_FLAGS_ROUTE = `${ITEMS_ROUTE}/flags`;
export const buildPostItemFlagRoute = (id: UUID) =>
  `${ITEMS_ROUTE}/${id}/flags`;

export const buildBookmarkedItemRoute = (itemId: UUID) =>
  `${GET_BOOKMARKED_ITEMS_ROUTE}/${itemId}`;

export const GET_CATEGORY_TYPES_ROUTE = `${ITEMS_ROUTE}/category-types`;
export const buildGetCategoriesRoute = (ids?: UUID[]) =>
  `${CATEGORIES_ROUTE}${qs.stringify(
    { typeId: ids },
    {
      arrayFormat: 'repeat',
      addQueryPrefix: true,
    },
  )}`;
export const buildGetCategoryRoute = (id: UUID) => `${CATEGORIES_ROUTE}/${id}`;
export const buildGetItemCategoriesRoute = (id: UUID) =>
  `${ITEMS_ROUTE}/${id}/categories`;
export const buildGetItemsInCategoryRoute = (ids: UUID[]) =>
  `${ITEMS_ROUTE}/with-categories${qs.stringify(
    { categoryId: ids },
    {
      arrayFormat: 'repeat',
      addQueryPrefix: true,
    },
  )}`;
export const buildPostItemCategoryRoute = (id: UUID) =>
  `${ITEMS_ROUTE}/${id}/categories`;
export const buildDeleteItemCategoryRoute = (args: {
  itemId: UUID;
  itemCategoryId: UUID;
}) => `${ITEMS_ROUTE}/${args.itemId}/categories/${args.itemCategoryId}`;

export const buildGetApiAccessTokenRoute = (id: UUID) =>
  `${APPS_ROUTE}/${id}/api-access-token`;

export const buildGetLikesForMemberRoute = (id: UUID) =>
  `${ITEMS_ROUTE}/liked${qs.stringify(
    { memberId: id },
    {
      addQueryPrefix: true,
    },
  )}`;
export const buildGetItemLikesRoute = (id: UUID) =>
  `${ITEMS_ROUTE}/${id}/likes`;
export const buildPostItemLikeRoute = (itemId: UUID) =>
  `${ITEMS_ROUTE}/${itemId}/like`;
export const buildDeleteItemLikeRoute = (itemId: UUID) =>
  `${ITEMS_ROUTE}/${itemId}/like`;

export const VALIDATION_ROUTE = 'validations';
export const buildGetLastItemValidationGroupRoute = (id: UUID) =>
  `${ITEMS_ROUTE}/${id}/${VALIDATION_ROUTE}/latest`;
export const buildGetItemValidationAndReviewRoute = (id: UUID) =>
  `${ITEMS_ROUTE}/${VALIDATION_ROUTE}/status/${id}`;
export const buildGetItemValidationGroupsRoute = (id: UUID) =>
  `${ITEMS_ROUTE}/${VALIDATION_ROUTE}/groups/${id}`;
export const GET_ITEM_VALIDATION_REVIEWS_ROUTE = `${ITEMS_ROUTE}/${VALIDATION_ROUTE}/reviews`;
export const GET_ITEM_VALIDATION_STATUSES_ROUTE = `${ITEMS_ROUTE}/${VALIDATION_ROUTE}/statuses`;
export const GET_ITEM_VALIDATION_REVIEW_STATUSES_ROUTE = `${ITEMS_ROUTE}/${VALIDATION_ROUTE}/review/statuses`;
export const buildPostItemValidationRoute = (id: UUID) =>
  `${ITEMS_ROUTE}/${id}/validate`;
export const buildUpdateItemValidationReviewRoute = (id: UUID) =>
  `${ITEMS_ROUTE}/${VALIDATION_ROUTE}/${id}/review`;
export const buildGetActions = (
  itemId: UUID,
  options: { requestedSampleSize: number; view: string },
) =>
  `${ITEMS_ROUTE}/${itemId}/actions${qs.stringify(
    {
      requestedSampleSize: options.requestedSampleSize,
      view: options.view,
    },
    {
      addQueryPrefix: true,
    },
  )}`;

export const buildGetAggregateActions = <K extends AggregateBy[]>(
  args: AggregateActionsArgs<K>,
) =>
  `${ITEMS_ROUTE}/${args.itemId}/actions/aggregation${qs.stringify(
    {
      requestedSampleSize: args.requestedSampleSize,
      view: args.view,
      type: args.type,
      countGroupBy: args.countGroupBy,
      aggregateFunction: args.aggregateFunction,
      aggregateMetric: args.aggregateMetric,
      aggregateBy: args.aggregateBy,
    },
    {
      addQueryPrefix: true,
      arrayFormat: 'repeat',
    },
  )}`;
export const buildExportActions = (
  itemId: UUID,
  format?: ExportActionsFormatting,
) =>
  `${ITEMS_ROUTE}/${itemId}/actions/export${qs.stringify(
    { format },
    { addQueryPrefix: true },
  )}`;
export const buildPostItemAction = (itemId: UUID) =>
  `${ITEMS_ROUTE}/${itemId}/actions`;
export const buildGetInvitationRoute = (id: UUID) =>
  `${ITEMS_ROUTE}/${INVITATIONS_ROUTE}/${id}`;
export const buildPatchInvitationRoute = (args: { itemId: UUID; id: UUID }) =>
  `${ITEMS_ROUTE}/${args.itemId}/${INVITATIONS_ROUTE}/${args.id}`;
export const buildDeleteInvitationRoute = (args: { itemId: UUID; id: UUID }) =>
  `${ITEMS_ROUTE}/${args.itemId}/${INVITATIONS_ROUTE}/${args.id}`;
export const buildPostInvitationsRoute = (itemId: UUID) =>
  `${ITEMS_ROUTE}/${itemId}/invite`;
export const buildResendInvitationRoute = (args: { itemId: UUID; id: UUID }) =>
  `${ITEMS_ROUTE}/${args.itemId}/${INVITATIONS_ROUTE}/${args.id}/send`;

export const buildItemPublishRoute = (itemId: UUID, notification?: boolean) =>
  // do not include notification query string if false
  `${ITEMS_ROUTE}/${COLLECTIONS_ROUTE}/${itemId}/publish${
    notification ? qs.stringify({ notification }, { addQueryPrefix: true }) : ''
  }`;
export const buildItemUnpublishRoute = (itemId: UUID) =>
  `${ITEMS_ROUTE}/${COLLECTIONS_ROUTE}/${itemId}/unpublish`;

export const buildGetItemPublishedInformationRoute = (itemId: UUID) =>
  `${ITEMS_ROUTE}/${COLLECTIONS_ROUTE}/${itemId}/informations`;
export const buildManyGetItemPublishedInformationsRoute = (itemIds: UUID[]) =>
  `${ITEMS_ROUTE}/${COLLECTIONS_ROUTE}/informations${qs.stringify(
    { itemId: itemIds },
    {
      arrayFormat: 'repeat',
      addQueryPrefix: true,
    },
  )}`;
export const buildGetAllPublishedItemsRoute = (categoryIds?: UUID[]) =>
  `${ITEMS_ROUTE}/${COLLECTIONS_ROUTE}${
    categoryIds?.length
      ? qs.stringify(
          { categoryId: categoryIds },
          {
            arrayFormat: 'repeat',
            addQueryPrefix: true,
          },
        )
      : ''
  }`;
export const buildGetMostLikedPublishedItemsRoute = (limit?: number) =>
  `${ITEMS_ROUTE}/${COLLECTIONS_ROUTE}/liked${
    limit ? qs.stringify({ limit }, { addQueryPrefix: true }) : ''
  }`;
export const buildGetMostRecentPublishedItemsRoute = (limit?: number) =>
  `${ITEMS_ROUTE}/${COLLECTIONS_ROUTE}/recent${
    limit ? qs.stringify({ limit }, { addQueryPrefix: true }) : ''
  }`;
export const buildGetPublishedItemsForMemberRoute = (memberId: UUID) =>
  `${ITEMS_ROUTE}/${COLLECTIONS_ROUTE}/members/${memberId}`;

export const buildPostEtherpadRoute = (parentId?: UUID) =>
  `${ETHERPAD_ROUTE}/create${qs.stringify(
    { parentId },
    { addQueryPrefix: true },
  )}`;
export const buildGetEtherpadRoute = (itemId: UUID) =>
  `${ETHERPAD_ROUTE}/view/${itemId}`;

export const SEARCH_PUBLISHED_ITEMS_ROUTE = `${ITEMS_ROUTE}/${COLLECTIONS_ROUTE}/search`;

export const buildGetShortLinkAvailableRoute = (alias: string) =>
  `${SHORT_LINKS_ROUTE}/available/${alias}`;
export const buildGetShortLinksItemRoute = (itemId: string) =>
  `${SHORT_LINKS_LIST_ROUTE}/${itemId}`;
export const buildDeleteShortLinkRoute = (alias: string) =>
  `${SHORT_LINKS_ROUTE}/${alias}`;
export const buildPostShortLinkRoute = () => `${SHORT_LINKS_ROUTE}`;
export const buildPatchShortLinkRoute = (alias: string) =>
  `${SHORT_LINKS_ROUTE}/${alias}`;

export const buildGetItemGeolocationRoute = (itemId: UUID) =>
  `${ITEMS_ROUTE}/${itemId}/geolocation`;
export const buildPutItemGeolocationRoute = (itemId: UUID) =>
  `${ITEMS_ROUTE}/${itemId}/geolocation`;
export const buildDeleteItemGeolocationRoute = (itemId: UUID) =>
  `${ITEMS_ROUTE}/${itemId}/geolocation`;
export const buildGetItemsInMapRoute = ({
  lat1,
  lat2,
  lng1,
  lng2,
  keywords,
  parentItemId,
}: {
  keywords?: string[];
  lat1?: ItemGeolocation['lat'];
  lat2?: ItemGeolocation['lat'];
  lng1?: ItemGeolocation['lng'];
  lng2?: ItemGeolocation['lng'];
  parentItemId?: DiscriminatedItem['id'];
}) => {
  const params = new URLSearchParams();
  if (lat1 || lat1 === 0) {
    params.append('lat1', lat1.toString());
  }
  if (lat2 || lat2 === 0) {
    params.append('lat2', lat2.toString());
  }
  if (lng1 || lng1 === 0) {
    params.append('lng1', lng1.toString());
  }
  if (lng2 || lng2 === 0) {
    params.append('lng2', lng2.toString());
  }
  if (parentItemId) {
    params.append('parentItemId', parentItemId);
  }
  keywords?.forEach((s) => params.append('keywords', s));

  const searchString = params.toString();

  return `${ITEMS_ROUTE}/geolocation?${searchString}`;
};
export const buildGetAddressFromCoordinatesRoute = ({
  lat,
  lng,
  lang = DEFAULT_LANG,
}: Pick<ItemGeolocation, 'lat' | 'lng'> & { lang?: string }) =>
  `${ITEMS_ROUTE}/geolocation/reverse?lat=${lat}&lng=${lng}&lang=${lang}`;

export const buildGetSuggestionsForAddressRoute = ({
  address,
  lang = DEFAULT_LANG,
}: {
  address: string;
  lang?: string;
}) => `${ITEMS_ROUTE}/geolocation/search?query=${address}&lang=${lang}`;

export const buildGetEmbeddedLinkMetadata = (link: string) =>
  `${EMBEDDED_LINKS_ROUTE}?link=${encodeURIComponent(link)}`;

export const API_ROUTES = {
  ...itemRoutes,
  ...memberRoutes,
  APPS_ROUTE,
  buildAppListRoute,
  buildClearItemChatRoute,
  buildDeleteInvitationRoute,
  buildDeleteItemCategoryRoute,
  buildDeleteItemChatMessageRoute,
  buildDeleteItemLikeRoute,
  buildDeleteItemLoginSchemaRoute,
  buildDeleteItemMembershipRoute,
  buildDeleteItemTagRoute,
  buildDeleteShortLinkRoute,
  buildEditItemMembershipRoute,
  buildExportActions,
  buildExportItemChatRoute,
  buildExportItemRoute,
  buildBookmarkedItemRoute,
  buildGetActions,
  buildGetAllPublishedItemsRoute,
  buildGetApiAccessTokenRoute,
  buildGetCategoriesRoute,
  buildGetCategoryRoute,
  buildGetEtherpadRoute,
  buildGetInvitationRoute,
  buildGetItemCategoriesRoute,
  buildGetItemChatRoute,
  buildGetItemInvitationsForItemRoute,
  buildGetItemLikesRoute,
  buildGetItemLoginSchemaRoute,
  buildGetItemLoginSchemaTypeRoute,
  buildGetItemMembershipsForItemsRoute,
  buildGetItemPublishedInformationRoute,
  buildGetItemsInCategoryRoute,
  buildGetItemTagsRoute,
  buildGetLastItemValidationGroupRoute,
  buildGetLikesForMemberRoute,
  buildGetMostLikedPublishedItemsRoute,
  buildGetMostRecentPublishedItemsRoute,
  buildGetPublishedItemsForMemberRoute,
  buildGetShortLinkAvailableRoute,
  buildGetShortLinksItemRoute,
  buildImportH5PRoute,
  buildImportZipRoute,
  buildItemPublishRoute,
  buildItemUnpublishRoute,
  buildManyGetItemPublishedInformationsRoute,
  buildPatchInvitationRoute,
  buildPatchItemChatMessageRoute,
  buildPatchShortLinkRoute,
  buildPostEtherpadRoute,
  buildPostInvitationsRoute,
  buildPostItemAction,
  buildPostItemCategoryRoute,
  buildPostItemChatMessageRoute,
  buildPostItemFlagRoute,
  buildPostItemLikeRoute,
  buildPostItemLoginSignInRoute,
  buildPostItemMembershipRoute,
  buildPostItemTagRoute,
  buildPostItemValidationRoute,
  buildPostManyItemMembershipsRoute,
  buildPostShortLinkRoute,
  buildPostUserCSVUploadRoute,
  buildPutItemLoginSchemaRoute,
  buildResendInvitationRoute,
  buildUpdateItemValidationReviewRoute,

  GET_CATEGORY_TYPES_ROUTE,
  GET_BOOKMARKED_ITEMS_ROUTE,
  GET_FLAGS_ROUTE,
  GET_ITEM_VALIDATION_REVIEWS_ROUTE,
  GET_ITEM_VALIDATION_STATUSES_ROUTE,
  GET_TAGS_ROUTE,
  ITEMS_ROUTE,
  SEARCH_PUBLISHED_ITEMS_ROUTE,
  SIGN_IN_ROUTE,
  SIGN_IN_WITH_PASSWORD_ROUTE,
  SIGN_OUT_ROUTE,
  SIGN_UP_ROUTE,
  VALIDATION_ROUTE,
  buildGetItemsInMapRoute,
  buildGetItemGeolocationRoute,
  buildDeleteItemGeolocationRoute,
  buildPutItemGeolocationRoute,
  buildGetAddressFromCoordinatesRoute,
  buildGetEmbeddedLinkMetadata,
};

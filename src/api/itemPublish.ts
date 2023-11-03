import { DiscriminatedItem, ItemPublished, ResultOf, UUID } from '@graasp/sdk';

import { PartialQueryConfigForApi } from '../types';
import { verifyAuthentication } from './axios';
import {
  buildGetAllPublishedItemsRoute,
  buildGetItemPublishedInformationRoute,
  buildGetMostLikedPublishedItemsRoute,
  buildGetMostRecentPublishedItemsRoute,
  buildGetPublishedItemsForMemberRoute,
  buildItemPublishRoute,
  buildItemUnpublishRoute,
  buildManyGetItemPublishedInformationsRoute,
} from './routes';

export const getAllPublishedItems = async (
  args: { categoryIds?: UUID[] },
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  axios
    .get<DiscriminatedItem[]>(
      `${API_HOST}/${buildGetAllPublishedItemsRoute(args?.categoryIds)}`,
    )
    .then(({ data }) => data);

export const getMostLikedPublishedItems = async (
  args: { limit?: number },
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  axios
    .get<DiscriminatedItem[]>(
      `${API_HOST}/${buildGetMostLikedPublishedItemsRoute(args?.limit)}`,
    )
    .then(({ data }) => data);

export const getMostRecentPublishedItems = async (
  args: { limit?: number },
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  axios
    .get<DiscriminatedItem[]>(
      `${API_HOST}/${buildGetMostRecentPublishedItemsRoute(args?.limit)}`,
    )
    .then(({ data }) => data);

export const getPublishedItemsForMember = async (
  memberId: UUID,
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  axios
    .get<DiscriminatedItem[]>(
      `${API_HOST}/${buildGetPublishedItemsForMemberRoute(memberId)}`,
    )
    .then(({ data }) => data);

export const getItemPublishedInformation = async (
  id: UUID,
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  axios
    .get<ItemPublished>(
      `${API_HOST}/${buildGetItemPublishedInformationRoute(id)}`,
    )
    .then(({ data }) => data);

export const getManyItemPublishedInformations = async (
  ids: UUID[],
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  axios
    .get<ResultOf<ItemPublished>>(
      `${API_HOST}/${buildManyGetItemPublishedInformationsRoute(ids)}`,
    )
    .then(({ data }) => data);

export const publishItem = async (
  id: UUID,
  { API_HOST, axios }: PartialQueryConfigForApi,
  notification?: boolean,
) =>
  verifyAuthentication(() =>
    axios
      .post<ItemPublished>(
        `${API_HOST}/${buildItemPublishRoute(id, notification)}`,
      )
      .then(({ data }) => data),
  );

export const unpublishItem = async (
  id: UUID,
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  verifyAuthentication(() =>
    axios
      .delete<ItemPublished>(`${API_HOST}/${buildItemUnpublishRoute(id)}`)
      .then(({ data }) => data),
  );

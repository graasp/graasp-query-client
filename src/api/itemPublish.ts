import { Item, ItemPublished, ResultOf, UUID } from '@graasp/sdk';

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
): Promise<Item[]> =>
  axios
    .get(`${API_HOST}/${buildGetAllPublishedItemsRoute(args?.categoryIds)}`)
    .then(({ data }) => data);

export const getMostLikedPublishedItems = async (
  args: { limit?: number },
  { API_HOST, axios }: PartialQueryConfigForApi,
): Promise<Item[]> =>
  axios
    .get(`${API_HOST}/${buildGetMostLikedPublishedItemsRoute(args?.limit)}`)
    .then(({ data }) => data);

export const getMostRecentPublishedItems = async (
  args: { limit?: number },
  { API_HOST, axios }: PartialQueryConfigForApi,
): Promise<Item[]> =>
  axios
    .get(`${API_HOST}/${buildGetMostRecentPublishedItemsRoute(args?.limit)}`)
    .then(({ data }) => data);

export const getPublishedItemsForMember = async (
  memberId: UUID,
  { API_HOST, axios }: PartialQueryConfigForApi,
): Promise<Item[]> =>
  axios
    .get(`${API_HOST}/${buildGetPublishedItemsForMemberRoute(memberId)}`)
    .then(({ data }) => data);

export const getItemPublishedInformation = async (
  id: UUID,
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  axios
    .get(`${API_HOST}/${buildGetItemPublishedInformationRoute(id)}`)
    .then(({ data }) => data);

export const getManyItemPublishedInformations = async (
  ids: UUID[],
  { API_HOST, axios }: PartialQueryConfigForApi,
): Promise<ResultOf<ItemPublished>> =>
  axios
    .get(`${API_HOST}/${buildManyGetItemPublishedInformationsRoute(ids)}`)
    .then(({ data }) => data);

export const publishItem = async (
  id: UUID,
  { API_HOST, axios }: PartialQueryConfigForApi,
  notification?: boolean,
): Promise<ItemPublished> =>
  verifyAuthentication(() =>
    axios
      .post(`${API_HOST}/${buildItemPublishRoute(id, notification)}`)
      .then(({ data }) => data),
  );

export const unpublishItem = async (
  id: UUID,
  { API_HOST, axios }: PartialQueryConfigForApi,
): Promise<ItemPublished> =>
  verifyAuthentication(() =>
    axios
      .delete(`${API_HOST}/${buildItemUnpublishRoute(id)}`)
      .then(({ data }) => data),
  );

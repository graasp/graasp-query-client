import { DiscriminatedItem, ItemGeolocation, UUID } from '@graasp/sdk';

import { PartialQueryConfigForApi } from '../types';
import { verifyAuthentication } from './axios';
import {
  buildDeleteItemGeolocationRoute,
  buildGetItemGeolocationRoute,
  buildGetItemsInMapRoute,
  buildPostItemWithGeolocationRoute,
  buildPutItemGeolocationRoute,
} from './routes';

// eslint-disable-next-line import/prefer-default-export
export const getItemGeolocation = async (
  { API_HOST, axios }: PartialQueryConfigForApi,
  id: UUID,
) =>
  axios
    .get<ItemGeolocation>(`${API_HOST}/${buildGetItemGeolocationRoute(id)}`)
    .then(({ data }) => data);

export const putItemGeolocation = async (
  payload: { itemId: UUID; lat: number; lng: number },
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  verifyAuthentication(() =>
    axios
      .put<void>(
        `${API_HOST}/${buildPutItemGeolocationRoute(payload.itemId)}`,
        { lat: payload.lat, lng: payload.lng },
      )
      .then(({ data }) => data),
  );

export const postItemWithGeolocation = async (
  payload: {
    lat: number;
    lng: number;
    parentItemId?: UUID;
  } & Partial<DiscriminatedItem>,
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  verifyAuthentication(() =>
    axios
      .post<void>(
        `${API_HOST}/${buildPostItemWithGeolocationRoute(
          payload.parentItemId,
        )}`,
        payload,
      )
      .then(({ data }) => data),
  );

export const getItemsInMap = async (
  payload: { lat1: number; lat2: number; lng1: number; lng2: number },
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  verifyAuthentication(() =>
    axios
      .get<ItemGeolocation[]>(`${API_HOST}/${buildGetItemsInMapRoute(payload)}`)
      .then(({ data }) => data),
  );

export const deleteItemGeolocation = async (
  payload: { itemId: UUID },
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  verifyAuthentication(() =>
    axios
      .delete<void>(
        `${API_HOST}/${buildDeleteItemGeolocationRoute(payload.itemId)}`,
      )
      .then(({ data }) => data),
  );

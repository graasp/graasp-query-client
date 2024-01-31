import { Item, ItemGeolocation, UUID } from '@graasp/sdk';

import { PartialQueryConfigForApi } from '../types';
import { verifyAuthentication } from './axios';
import {
  buildDeleteItemGeolocationRoute,
  buildGetItemGeolocationRoute,
  buildGetItemsInMapRoute,
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
  payload: {
    itemId: Item['id'];
    geolocation: Pick<ItemGeolocation, 'lat' | 'lng'>;
  },
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  verifyAuthentication(() =>
    axios
      .put<void>(
        `${API_HOST}/${buildPutItemGeolocationRoute(payload.itemId)}`,
        payload,
      )
      .then(({ data }) => data),
  );

export const getItemsInMap = async (
  payload: {
    lat1: ItemGeolocation['lat'];
    lat2: ItemGeolocation['lat'];
    lng1: ItemGeolocation['lng'];
    lng2: ItemGeolocation['lng'];
    search?: string[];
  },
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

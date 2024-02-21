import { DiscriminatedItem, ItemGeolocation, UUID } from '@graasp/sdk';

import { PartialQueryConfigForApi } from '../types.js';
import { verifyAuthentication } from './axios.js';
import {
  buildDeleteItemGeolocationRoute,
  buildGetAddressFromCoordinatesRoute,
  buildGetItemGeolocationRoute,
  buildGetItemsInMapRoute,
  buildPutItemGeolocationRoute,
} from './routes.js';

export const getItemGeolocation = async (
  { API_HOST, axios }: PartialQueryConfigForApi,
  id: UUID,
) =>
  axios
    .get<ItemGeolocation | null>(
      `${API_HOST}/${buildGetItemGeolocationRoute(id)}`,
    )
    .then(({ data }) => data);

export const putItemGeolocation = async (
  payload: {
    itemId: DiscriminatedItem['id'];
    geolocation: Pick<ItemGeolocation, 'lat' | 'lng'> &
      Pick<Partial<ItemGeolocation>, 'country' | 'addressLabel'>;
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
    lat1?: ItemGeolocation['lat'];
    lat2?: ItemGeolocation['lat'];
    lng1?: ItemGeolocation['lng'];
    lng2?: ItemGeolocation['lng'];
    parentItemId?: DiscriminatedItem['id'];
    keywords?: string[];
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

export const getAddressFromCoordinates = async (
  { lat, lng }: Pick<ItemGeolocation, 'lat' | 'lng'>,
  { axios }: PartialQueryConfigForApi,
) =>
  axios
    .get<{ display_name: string; country_code: string }>(
      buildGetAddressFromCoordinatesRoute({ lat, lng }),
      {
        responseType: 'json',
      },
    )
    .then(({ data }) => data);

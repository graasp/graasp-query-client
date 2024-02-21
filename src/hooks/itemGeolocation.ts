import { DiscriminatedItem, ItemGeolocation } from '@graasp/sdk';

import { useQuery } from 'react-query';

import * as Api from '../api/itemGeolocation.js';
import { UndefinedArgument } from '../config/errors.js';
import {
  buildAddressFromCoordinatesKey,
  itemKeys,
  itemsWithGeolocationKeys,
} from '../config/keys.js';
import {
  getAddressFromCoordinatesRoutine,
  getItemGeolocationRoutine,
} from '../routines/itemGeolocation.js';
import { QueryClientConfig } from '../types.js';

export default (queryConfig: QueryClientConfig) => {
  const { notifier, defaultQueryOptions } = queryConfig;

  const useItemGeolocation = (id?: DiscriminatedItem['id']) =>
    useQuery({
      queryKey: itemKeys.single(id).geolocation,
      queryFn: () => {
        if (!id) {
          throw new UndefinedArgument();
        }
        return Api.getItemGeolocation(queryConfig, id);
      },
      ...defaultQueryOptions,
      enabled: Boolean(id),
      onError: (error) => {
        notifier?.({
          type: getItemGeolocationRoutine.FAILURE,
          payload: { error },
        });
      },
    });

  const useItemsInMap = ({
    lat1,
    lat2,
    lng1,
    lng2,
    keywords,
    parentItemId,
  }: {
    lat1?: ItemGeolocation['lat'];
    lat2?: ItemGeolocation['lat'];
    lng1?: ItemGeolocation['lng'];
    lng2?: ItemGeolocation['lng'];
    keywords?: string[];
    parentItemId?: DiscriminatedItem['id'];
  }) => {
    const enabled = Boolean(
      ((lat1 || lat1 === 0) &&
        (lat2 || lat2 === 0) &&
        (lng1 || lng1 === 0) &&
        (lng2 || lng2 === 0)) ||
        parentItemId,
    );

    return useQuery({
      queryKey: itemsWithGeolocationKeys.inBounds({
        lat1,
        lat2,
        lng1,
        lng2,
        keywords,
        parentItemId,
      }),
      queryFn: () => {
        if (!enabled) {
          throw new UndefinedArgument({
            lat1,
            lat2,
            lng1,
            lng2,
            parentItemId,
            keywords,
          });
        }

        return Api.getItemsInMap(
          { lat1, lat2, lng1, lng2, keywords, parentItemId },
          queryConfig,
        );
      },
      enabled,
      ...defaultQueryOptions,
    });
  };

  const useAddressFromGeolocation = ({
    lat,
    lng,
  }: Pick<ItemGeolocation, 'lat' | 'lng'>) =>
    useQuery({
      queryKey: buildAddressFromCoordinatesKey({ lat, lng }),
      queryFn: () => {
        if (!(lat || lat === 0) || !(lng || lng === 0)) {
          throw new UndefinedArgument();
        }
        return Api.getAddressFromCoordinates({ lat, lng }, queryConfig);
      },
      ...defaultQueryOptions,
      enabled: Boolean((lat || lat === 0) && (lng || lng === 0)),
      onError: (error) => {
        notifier?.({
          type: getAddressFromCoordinatesRoutine.FAILURE,
          payload: { error },
        });
      },
    });

  return { useItemGeolocation, useItemsInMap, useAddressFromGeolocation };
};

import { DiscriminatedItem, ItemGeolocation } from '@graasp/sdk';
import { DEFAULT_LANG } from '@graasp/translations';

import { useQuery } from '@tanstack/react-query';

import * as Api from '../api/itemGeolocation.js';
import { UndefinedArgument } from '../config/errors.js';
import {
  buildAddressFromCoordinatesKey,
  buildSuggestionsForAddressKey,
  itemKeys,
  itemsWithGeolocationKeys,
} from '../keys.js';
import {
  getAddressFromCoordinatesRoutine,
  getItemGeolocationRoutine,
  getSuggestionsForAddressRoutine,
} from '../routines/itemGeolocation.js';
import { QueryClientConfig } from '../types.js';
import useDebounce from './useDebounce.js';

export default (queryConfig: QueryClientConfig) => {
  const { defaultQueryOptions } = queryConfig;

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
      meta: {
        routine: getItemGeolocationRoutine,
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

  const useAddressFromGeolocation = (
    payload:
      | (Pick<ItemGeolocation, 'lat' | 'lng'> & { lang?: string })
      | undefined,
    options: { enabled?: boolean } = {},
  ) => {
    const { enabled = true } = options;
    const { lat, lng, lang } = payload ?? {};
    return useQuery({
      // to remove when endpoint is trusted
      retry: false,
      queryKey: buildAddressFromCoordinatesKey(payload),
      queryFn: () => {
        if (!(lat || lat === 0) || !(lng || lng === 0)) {
          throw new UndefinedArgument();
        }
        return Api.getAddressFromCoordinates({ lat, lng, lang }, queryConfig);
      },
      ...defaultQueryOptions,
      enabled: Boolean((lat || lat === 0) && (lng || lng === 0)) && enabled,
      meta: {
        routine: getAddressFromCoordinatesRoutine,
      },
    });
  };

  const useSuggestionsForAddress = (
    {
      address,
      lang = DEFAULT_LANG,
    }: {
      address?: string;
      lang?: string;
    },
    options: { enabled?: boolean } = {},
  ) => {
    const { enabled = true } = options;
    const debouncedAddress = useDebounce(address, 500);
    return useQuery({
      // to remove when endpoint is trusted
      retry: false,
      queryKey: buildSuggestionsForAddressKey({
        address: debouncedAddress,
        lang,
      }),
      queryFn: () => {
        if (!debouncedAddress) {
          throw new UndefinedArgument();
        }

        return Api.getSuggestionsForAddress(
          { address: debouncedAddress, lang },
          queryConfig,
        );
      },
      ...defaultQueryOptions,
      enabled: Boolean(debouncedAddress) && enabled,
      meta: {
        routine: getSuggestionsForAddressRoutine,
      },
    });
  };

  return {
    useItemGeolocation,
    useItemsInMap,
    useAddressFromGeolocation,
    useSuggestionsForAddress,
  };
};

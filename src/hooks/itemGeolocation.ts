import { Item, ItemGeolocation } from '@graasp/sdk';

import { useQuery } from 'react-query';

import * as Api from '../api';
import { UndefinedArgument } from '../config/errors';
import {
  buildItemGeolocationKey,
  itemsWithGeolocationKeys,
} from '../config/keys';
import { getItemGeolocationRoutine } from '../routines/itemGeolocation';
import { QueryClientConfig } from '../types';

export default (queryConfig: QueryClientConfig) => {
  const { notifier, defaultQueryOptions } = queryConfig;

  const useItemGeolocation = (id?: Item['id']) =>
    useQuery({
      queryKey: buildItemGeolocationKey(id),
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
  }: {
    lat1: ItemGeolocation['lat'];
    lat2: ItemGeolocation['lat'];
    lng1: ItemGeolocation['lng'];
    lng2: ItemGeolocation['lng'];
  }) => {
    const enabled = Boolean(
      (lat1 || lat1 === 0) &&
        (lat2 || lat2 === 0) &&
        (lng1 || lng1 === 0) &&
        (lng2 || lng2 === 0),
    );

    return useQuery({
      queryKey: itemsWithGeolocationKeys.inBounds({ lat1, lat2, lng1, lng2 }),
      queryFn: () => {
        if (!enabled) {
          throw new UndefinedArgument({ lat1, lat2, lng1, lng2 });
        }

        return Api.getItemsInMap({ lat1, lat2, lng1, lng2 }, queryConfig);
      },
      enabled,
      ...defaultQueryOptions,
    });
  };

  return { useItemGeolocation, useItemsInMap };
};

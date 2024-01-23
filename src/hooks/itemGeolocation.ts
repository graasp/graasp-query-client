import { UUID } from '@graasp/sdk';

import { useQuery } from 'react-query';

import * as Api from '../api';
import { UndefinedArgument } from '../config/errors';
import { buildItemGeolocationKey, buildItemsInMapKey } from '../config/keys';
import { getItemGeolocationRoutine } from '../routines/itemGeolocation';
import { QueryClientConfig } from '../types';

export default (queryConfig: QueryClientConfig) => {
  const { notifier, defaultQueryOptions } = queryConfig;

  const useItemGeolocation = (id?: UUID) =>
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
    lat1: number;
    lat2: number;
    lng1: number;
    lng2: number;
  }) =>
    useQuery({
      queryKey: buildItemsInMapKey({ lat1, lat2, lng1, lng2 }),
      queryFn: () => {
        if (!lat1 || !lat2 || !lng1 || !lng2) {
          throw new UndefinedArgument({ lat1, lat2, lng1, lng2 });
        }

        return Api.getItemsInMap({ lat1, lat2, lng1, lng2 }, queryConfig);
      },
      // question: cat lat or lng be 0?
      enabled: Boolean(lat1 && lat2 && lng1 && lng2),
      ...defaultQueryOptions,
    });

  return { useItemGeolocation, useItemsInMap };
};

import { Item, ItemGeolocation } from '@graasp/sdk';

import { useMutation, useQueryClient } from 'react-query';

import { deleteItemGeolocation, putItemGeolocation } from '../api';
import {
  buildItemGeolocationKey,
  itemsWithGeolocationKeys,
} from '../config/keys';
import {
  deleteItemGeolocationRoutine,
  putItemGeolocationRoutine,
} from '../routines';
import { QueryClientConfig } from '../types';

export default (queryConfig: QueryClientConfig) => {
  const usePutItemGeolocation = () => {
    const queryClient = useQueryClient();
    return useMutation(
      (
        payload: { itemId: Item['id'] } & Pick<ItemGeolocation, 'lat' | 'lng'>,
      ) => putItemGeolocation(payload, queryConfig),
      {
        onSuccess: () => {
          queryConfig.notifier?.({
            type: putItemGeolocationRoutine.SUCCESS,
          });
        },
        onError: (error: Error) => {
          queryConfig.notifier?.({
            type: putItemGeolocationRoutine.FAILURE,
            payload: { error },
          });
        },
        onSettled: (_data, _error, { itemId }) => {
          queryClient.invalidateQueries(buildItemGeolocationKey(itemId));
          queryClient.invalidateQueries(itemsWithGeolocationKeys.allBounds);
        },
      },
    );
  };

  const useDeleteItemGeolocation = () => {
    const queryClient = useQueryClient();
    return useMutation(
      (payload: { itemId: Item['id'] }) =>
        deleteItemGeolocation(payload, queryConfig),
      {
        onSuccess: () => {
          queryConfig.notifier?.({
            type: deleteItemGeolocationRoutine.SUCCESS,
          });
        },
        onError: (error: Error) => {
          queryConfig.notifier?.({
            type: deleteItemGeolocationRoutine.FAILURE,
            payload: { error },
          });
        },
        onSettled: (_data, _error, { itemId }) => {
          queryClient.invalidateQueries(buildItemGeolocationKey(itemId));
          queryClient.invalidateQueries(itemsWithGeolocationKeys.allBounds);
        },
      },
    );
  };

  return {
    usePutItemGeolocation,
    useDeleteItemGeolocation,
  };
};

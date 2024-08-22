import { DiscriminatedItem, ItemGeolocation } from '@graasp/sdk';
import { SUCCESS_MESSAGES } from '@graasp/translations';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import * as Api from '../api/itemGeolocation.js';
import { itemKeys, itemsWithGeolocationKeys } from '../keys.js';
import {
  deleteItemGeolocationRoutine,
  putItemGeolocationRoutine,
} from '../routines/itemGeolocation.js';
import { QueryClientConfig } from '../types.js';

export default (queryConfig: QueryClientConfig) => {
  const usePutItemGeolocation = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (payload: {
        itemId: DiscriminatedItem['id'];
        geolocation: Pick<ItemGeolocation, 'lat' | 'lng'> &
          Pick<
            Partial<ItemGeolocation>,
            'country' | 'addressLabel' | 'helperLabel'
          >;
      }) => Api.putItemGeolocation(payload, queryConfig),
      onSuccess: () => {
        queryConfig.notifier?.({
          type: putItemGeolocationRoutine.SUCCESS,
          payload: { message: SUCCESS_MESSAGES.PUT_ITEM_GEOLOCATION },
        });
      },
      onError: (error: Error) => {
        queryConfig.notifier?.({
          type: putItemGeolocationRoutine.FAILURE,
          payload: { error },
        });
      },
      onSettled: (_data, _error, { itemId }) => {
        queryClient.invalidateQueries({
          queryKey: itemKeys.single(itemId).geolocation,
        });
        queryClient.invalidateQueries({
          queryKey: itemsWithGeolocationKeys.allBounds,
        });
      },
    });
  };

  const useDeleteItemGeolocation = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (payload: { itemId: DiscriminatedItem['id'] }) =>
        Api.deleteItemGeolocation(payload, queryConfig),
      onSuccess: () => {
        queryConfig.notifier?.({
          type: deleteItemGeolocationRoutine.SUCCESS,
          payload: { message: SUCCESS_MESSAGES.DELETE_ITEM_GEOLOCATION },
        });
      },
      onError: (error: Error) => {
        queryConfig.notifier?.({
          type: deleteItemGeolocationRoutine.FAILURE,
          payload: { error },
        });
      },
      onSettled: (_data, _error, { itemId }) => {
        queryClient.invalidateQueries({
          queryKey: itemKeys.single(itemId).geolocation,
        });
        queryClient.invalidateQueries({
          queryKey: itemsWithGeolocationKeys.allBounds,
        });
      },
    });
  };

  return {
    usePutItemGeolocation,
    useDeleteItemGeolocation,
  };
};

import { DiscriminatedItem, ItemGeolocation } from '@graasp/sdk';
import { SUCCESS_MESSAGES } from '@graasp/translations';

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
      (payload: {
        itemId: DiscriminatedItem['id'];
        geolocation: Pick<ItemGeolocation, 'lat' | 'lng'> &
          Pick<Partial<ItemGeolocation>, 'country' | 'addressLabel'>;
      }) => putItemGeolocation(payload, queryConfig),
      {
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
          queryClient.invalidateQueries(buildItemGeolocationKey(itemId));
          queryClient.invalidateQueries(itemsWithGeolocationKeys.allBounds);
        },
      },
    );
  };

  const useDeleteItemGeolocation = () => {
    const queryClient = useQueryClient();
    return useMutation(
      (payload: { itemId: DiscriminatedItem['id'] }) =>
        deleteItemGeolocation(payload, queryConfig),
      {
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

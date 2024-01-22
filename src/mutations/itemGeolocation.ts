import { UUID } from '@graasp/sdk';

import { useMutation, useQueryClient } from 'react-query';

import { deleteItemGeolocation, putItemGeolocation } from '../api';
import { buildItemGeolocationKey } from '../config/keys';
import {
  deleteItemGeolocationRoutine,
  putItemGeolocationRoutine,
} from '../routines';
import { QueryClientConfig } from '../types';

export default (queryConfig: QueryClientConfig) => {
  const usePutItemGeolocation = () => {
    const queryClient = useQueryClient();
    return useMutation(
      (payload: { itemId: UUID; lat: number; lng: number }) =>
        putItemGeolocation(payload, queryConfig),
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
        },
      },
    );
  };

  const useDeleteItemGeolocation = () => {
    const queryClient = useQueryClient();
    return useMutation(
      (payload: { itemId: UUID }) =>
        deleteItemGeolocation(payload, queryConfig),
      {
        onMutate: async ({ id, itemId }: { id: UUID; itemId: UUID }) => {
          const key = buildItemGeolocationKey(itemId);

          const prevValue = queryClient.getQueryData<ItemGeolocation[]>(key);

          // remove ItemGeolocation from list
          if (prevValue) {
            queryClient.setQueryData(
              key,
              prevValue.filter(({ id: iId }) => iId !== id),
            );
            return { prevValue };
          }
          return {};
        },
        onSuccess: () => {
          queryConfig.notifier?.({
            type: deleteItemGeolocationRoutine.SUCCESS,
          });
        },
        onError: (error: Error, { itemId }, context) => {
          const key = buildItemGeolocationKey(itemId);
          queryClient.setQueryData(key, context?.prevValue);
          queryConfig.notifier?.({
            type: deleteItemGeolocationRoutine.FAILURE,
            payload: { error },
          });
        },
        onSettled: (_data, _error, { itemId }) => {
          queryClient.invalidateQueries(buildItemGeolocationKey(itemId));
        },
      },
    );
  };

  return { usePutItemGeolocation, useDeleteItemGeolocation };
};

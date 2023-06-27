import { useMutation, useQueryClient } from 'react-query';

import { ItemLoginSchemaType, UUID } from '@graasp/sdk';
import { SUCCESS_MESSAGES } from '@graasp/translations';

import * as Api from '../api';
import { buildItemLoginSchemaKey } from '../config/keys';
import {
  deleteItemLoginSchemaRoutine,
  postItemLoginRoutine,
  putItemLoginSchemaRoutine,
} from '../routines';
import type { QueryClientConfig } from '../types';

export default (queryConfig: QueryClientConfig) => {
  const { notifier } = queryConfig;

  const usePostItemLogin = () => {
    const queryClient = useQueryClient();
    return useMutation(
      (payload: {
        itemId: UUID;
        username?: string;
        memberId?: UUID;
        password?: string;
      }) => Api.postItemLoginSignIn(payload, queryConfig),
      {
        onError: (error: Error) => {
          notifier?.({
            type: postItemLoginRoutine.FAILURE,
            payload: { error },
          });
        },
        onSettled: () => {
          // reset all queries when trying to sign in
          queryClient.resetQueries();
        },
      },
    );
  };

  const usePutItemLoginSchema = () => {
    const queryClient = useQueryClient();
    return useMutation(
      (payload: { itemId: UUID; type: ItemLoginSchemaType }) =>
        Api.putItemLoginSchema(payload, queryConfig),
      {
        onSuccess: () => {
          notifier?.({
            type: putItemLoginSchemaRoutine.SUCCESS,
            payload: { message: SUCCESS_MESSAGES.PUT_ITEM_LOGIN_SCHEMA },
          });
        },
        onError: (error: Error) => {
          notifier?.({
            type: putItemLoginSchemaRoutine.FAILURE,
            payload: { error },
          });
        },
        onSettled: (_data, _error, { itemId }) => {
          queryClient.invalidateQueries(buildItemLoginSchemaKey(itemId));
        },
      },
    );
  };

  const useDeleteItemLoginSchema = () => {
    const queryClient = useQueryClient();
    return useMutation(
      (payload: { itemId: UUID }) =>
        Api.deleteItemLoginSchema(payload, queryConfig),
      {
        onMutate: ({ itemId }) => {
          const key = buildItemLoginSchemaKey(itemId);
          const previous = queryClient.getQueryData(key);
          queryClient.setQueryData(key, null);
          return previous;
        },
        onSuccess: () => {
          notifier?.({
            type: deleteItemLoginSchemaRoutine.SUCCESS,
            payload: { message: SUCCESS_MESSAGES.DELETE_ITEM_LOGIN_SCHEMA },
          });
        },
        onError: (error: Error, { itemId }, previous) => {
          notifier?.({
            type: deleteItemLoginSchemaRoutine.FAILURE,
            payload: { error },
          });
          queryClient.setQueryData(buildItemLoginSchemaKey(itemId), previous);
        },
        onSettled: (_data, _error, { itemId }) => {
          // it is not necessary to update the cache for the given item login schema
          // because the item login only applies if the user is signed out
          queryClient.invalidateQueries(buildItemLoginSchemaKey(itemId));
        },
      },
    );
  };

  return {
    usePostItemLogin,
    useDeleteItemLoginSchema,
    usePutItemLoginSchema,
  };
};

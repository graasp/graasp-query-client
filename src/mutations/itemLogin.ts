import { QueryClient, useMutation } from 'react-query';

import { ItemLoginSchemaType, UUID } from '@graasp/sdk';
import { SUCCESS_MESSAGES } from '@graasp/translations';

import * as Api from '../api';
import { MUTATION_KEYS, buildItemLoginSchemaKey } from '../config/keys';
import {
  deleteItemLoginSchemaRoutine,
  postItemLoginRoutine,
  putItemLoginSchemaRoutine,
} from '../routines';
import type { QueryClientConfig } from '../types';

const { POST_ITEM_LOGIN, PUT_ITEM_LOGIN_SCHEMA, DELETE_ITEM_LOGIN_SCHEMA } =
  MUTATION_KEYS;

export default (queryClient: QueryClient, queryConfig: QueryClientConfig) => {
  const { notifier } = queryConfig;

  queryClient.setMutationDefaults(POST_ITEM_LOGIN, {
    mutationFn: (payload) => Api.postItemLoginSignIn(payload, queryConfig),
    onError: (error) => {
      notifier?.({ type: postItemLoginRoutine.FAILURE, payload: { error } });
    },
    onSettled: () => {
      // reset all queries when trying to sign in
      queryClient.resetQueries();
    },
  });
  const usePostItemLogin = () =>
    useMutation<
      void,
      unknown,
      { itemId: UUID; username?: string; memberId?: UUID; password?: string }
    >(POST_ITEM_LOGIN);

  queryClient.setMutationDefaults(PUT_ITEM_LOGIN_SCHEMA, {
    mutationFn: (payload) => Api.putItemLoginSchema(payload, queryConfig),
    onSuccess: () => {
      notifier?.({
        type: putItemLoginSchemaRoutine.SUCCESS,
        payload: { message: SUCCESS_MESSAGES.PUT_ITEM_LOGIN_SCHEMA },
      });
    },
    onError: (error) => {
      notifier?.({
        type: putItemLoginSchemaRoutine.FAILURE,
        payload: { error },
      });
    },
    onSettled: (_data, _error, { itemId }) => {
      queryClient.invalidateQueries(buildItemLoginSchemaKey(itemId));
    },
  });
  const usePutItemLoginSchema = () =>
    useMutation<void, unknown, { itemId: UUID; type: ItemLoginSchemaType }>(
      PUT_ITEM_LOGIN_SCHEMA,
    );

  queryClient.setMutationDefaults(DELETE_ITEM_LOGIN_SCHEMA, {
    mutationFn: (payload) => Api.deleteItemLoginSchema(payload, queryConfig),
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
    onError: (error, { itemId }, previous) => {
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
  });
  const useDeleteItemLoginSchema = () =>
    useMutation<void, unknown, { itemId: UUID }>(DELETE_ITEM_LOGIN_SCHEMA);

  return {
    usePostItemLogin,
    useDeleteItemLoginSchema,
    usePutItemLoginSchema,
  };
};

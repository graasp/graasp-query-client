import { ItemLoginSchemaStatus, ItemLoginSchemaType, UUID } from '@graasp/sdk';
import { SUCCESS_MESSAGES } from '@graasp/translations';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import * as Api from '../api/itemLogin.js';
import { useEnroll } from '../item/itemLogin/mutations.js';
import { itemKeys } from '../keys.js';
import {
  postItemLoginRoutine,
  putItemLoginSchemaRoutine,
} from '../routines/itemLogin.js';
import type { QueryClientConfig } from '../types.js';

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
      (payload: {
        itemId: UUID;
        type?: ItemLoginSchemaType;
        status?: ItemLoginSchemaStatus;
      }) => Api.putItemLoginSchema(payload, queryConfig),
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
          queryClient.invalidateQueries(
            itemKeys.single(itemId).itemLoginSchema.content,
          );
        },
      },
    );
  };

  return {
    useEnroll: useEnroll(queryConfig),
    usePostItemLogin,
    usePutItemLoginSchema,
  };
};

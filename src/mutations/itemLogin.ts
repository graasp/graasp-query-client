import { QueryClient } from 'react-query';

import { SUCCESS_MESSAGES } from '@graasp/translations';

import * as Api from '../api';
import { MUTATION_KEYS, buildItemLoginKey } from '../config/keys';
import { postItemLoginRoutine, putItemLoginRoutine } from '../routines';
import type { QueryClientConfig } from '../types';

const { POST_ITEM_LOGIN, PUT_ITEM_LOGIN } = MUTATION_KEYS;

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

  queryClient.setMutationDefaults(PUT_ITEM_LOGIN, {
    mutationFn: (payload) => Api.putItemLoginSchema(payload, queryConfig),
    onSuccess: () => {
      notifier?.({
        type: putItemLoginRoutine.SUCCESS,
        payload: { message: SUCCESS_MESSAGES.PUT_ITEM_LOGIN },
      });
    },
    onError: (error) => {
      notifier?.({ type: putItemLoginRoutine.FAILURE, payload: { error } });
    },
    onSettled: (_data, _error, { itemId }) => {
      // it is not necessary to update the cache for the given item login schema
      // because the item login only applies if the user is signed out
      queryClient.invalidateQueries(buildItemLoginKey(itemId));
    },
  });
};

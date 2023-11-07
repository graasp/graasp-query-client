import { SUCCESS_MESSAGES } from '@graasp/translations';

import { useMutation, useQueryClient } from 'react-query';

import * as Api from '../api';
import { PostProfilePayloadType } from '../api';
import { createItemRoutine } from '../routines';
import type { QueryClientConfig } from '../types';

export default (queryConfig: QueryClientConfig) => {
  const { notifier } = queryConfig;

  const usePostProfile = () => {
    const queryClient = useQueryClient();
    return useMutation(
      async (profileData: PostProfilePayloadType) =>
        Api.postProfile(profileData, queryConfig),
      {
        onSuccess: () => {
          notifier?.({
            type: createItemRoutine.SUCCESS,
            payload: { message: SUCCESS_MESSAGES.CREATE_ITEM },
          });
        },
        onError: (error: Error) => {
          notifier?.({ type: createItemRoutine.FAILURE, payload: { error } });
        },
      },
    );
  };

  return {
    usePostProfile,
  };
};

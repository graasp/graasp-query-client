import { SUCCESS_MESSAGES } from '@graasp/translations';

import { useMutation } from '@tanstack/react-query';

import * as Api from '../api/publicProfile.js';
import type { PostPublicProfilePayloadType } from '../api/publicProfile.js';
import {
  patchPublicProfileRoutine,
  postPublicProfileRoutine,
} from '../routines/publicProfile.js';
import type { QueryClientConfig } from '../types.js';

export default (queryConfig: QueryClientConfig) => {
  const { notifier } = queryConfig;

  const usePostPublicProfile = () =>
    useMutation(
      async (profileData: PostPublicProfilePayloadType) =>
        Api.postPublicProfile(profileData, queryConfig),
      {
        onSuccess: () => {
          notifier?.({
            type: postPublicProfileRoutine.SUCCESS,
            payload: { message: SUCCESS_MESSAGES.POST_PROFILE },
          });
        },
        onError: (error: Error) => {
          notifier?.({
            type: postPublicProfileRoutine.FAILURE,
            payload: { error },
          });
        },
      },
    );
  const usePatchPublicProfile = () =>
    useMutation(
      (payload: Partial<PostPublicProfilePayloadType>) =>
        Api.patchPublicProfile(payload, queryConfig),
      {
        onSuccess: () => {
          notifier?.({
            type: patchPublicProfileRoutine.SUCCESS,
            payload: { message: SUCCESS_MESSAGES.PATCH_PROFILE },
          });
        },
        onError: (error: Error) => {
          notifier?.({
            type: patchPublicProfileRoutine.FAILURE,
            payload: { error },
          });
        },
      },
    );

  return {
    usePostPublicProfile,
    usePatchPublicProfile,
  };
};

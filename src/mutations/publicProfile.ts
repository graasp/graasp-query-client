import { useMutation } from 'react-query';

import * as Api from '../api';
import { PostPublicProfilePayloadType } from '../api';
import {
  patchPublicProfileRoutine,
  postPublicProfileRoutine,
} from '../routines';
import type { QueryClientConfig } from '../types';

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
            payload: { message: 'Your Data Saved Successfully' },
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
            payload: { message: 'Your Data Saved Successfully' },
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

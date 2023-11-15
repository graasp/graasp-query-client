import { useMutation } from 'react-query';

import * as Api from '../api';
import { PostProfilePayloadType } from '../api';
import { patchProfileRoutine, postProfileRoutine } from '../routines';
import type { QueryClientConfig } from '../types';

export default (queryConfig: QueryClientConfig) => {
  const { notifier } = queryConfig;

  const usePostProfile = () =>
    useMutation(
      async (profileData: PostProfilePayloadType) =>
        Api.postProfile(profileData, queryConfig),
      {
        onSuccess: () => {
          notifier?.({
            type: postProfileRoutine.SUCCESS,
            payload: { message: 'Your Data Saved Successfully' },
          });
        },
        onError: (error: Error) => {
          notifier?.({ type: postProfileRoutine.FAILURE, payload: { error } });
        },
      },
    );
  const usePatchProfile = () =>
    useMutation(
      (payload: Partial<PostProfilePayloadType>) =>
        Api.patchProfile(payload, queryConfig),
      {
        onSuccess: () => {
          notifier?.({
            type: patchProfileRoutine.SUCCESS,
            payload: { message: 'Your Data Saved Successfully' },
          });
        },
        onError: (error: Error) => {
          notifier?.({ type: patchProfileRoutine.FAILURE, payload: { error } });
        },
      },
    );

  return {
    usePostProfile,
    usePatchProfile,
  };
};

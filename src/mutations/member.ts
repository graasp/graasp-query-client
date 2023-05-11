import { QueryClient, useMutation } from 'react-query';

import { MemberExtra, ThumbnailSize, UUID, convertJs } from '@graasp/sdk';
import { MemberRecord } from '@graasp/sdk/frontend';
import { SUCCESS_MESSAGES } from '@graasp/translations';

import * as Api from '../api';
import { throwIfArrayContainsErrorOrReturn } from '../api/axios';
import {
  CURRENT_MEMBER_KEY,
  MUTATION_KEYS,
  buildAvatarKey,
} from '../config/keys';
import {
  deleteMemberRoutine,
  editMemberRoutine,
  uploadAvatarRoutine,
} from '../routines';
import { QueryClientConfig } from '../types';

const {
  DELETE_MEMBER,
  EDIT_MEMBER,
  UPLOAD_AVATAR,
} = MUTATION_KEYS;

export default (queryClient: QueryClient, queryConfig: QueryClientConfig) => {
  const { notifier } = queryConfig;

  queryClient.setMutationDefaults(DELETE_MEMBER, {
    mutationFn: (payload) =>
      Api.deleteMember(payload, queryConfig).then(() =>
        Api.signOut(queryConfig),
      ),
    onSuccess: (_data, { id: _id }) => {
      notifier?.({
        type: deleteMemberRoutine.SUCCESS,
        payload: { message: SUCCESS_MESSAGES.DELETE_MEMBER },
      });

      queryClient.resetQueries();

      // remove cookies from browser when logout succeeds
      if (queryConfig.DOMAIN) {
        // todo: find a way to do this with an httpOnly cookie
        // removeSession(id, queryConfig.DOMAIN);
        // setCurrentSession(null, queryConfig.DOMAIN);
      }

      // Update when the server confirmed the logout, instead optimistically updating the member
      // This prevents logout loop (redirect to logout -> still cookie -> logs back in)
      queryClient.setQueryData(CURRENT_MEMBER_KEY, undefined);
    },
    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (error, _args, _context) => {
      notifier?.({ type: deleteMemberRoutine.FAILURE, payload: { error } });
    },
  });
  const useDeleteMember = () =>
    useMutation<void, unknown, { id: UUID }>(DELETE_MEMBER);

  // suppose you can only edit yourself
  queryClient.setMutationDefaults(EDIT_MEMBER, {
    mutationFn: (payload: { id: UUID; extra: MemberExtra }) =>
      Api.editMember(payload, queryConfig).then((member) => convertJs(member)),
    onMutate: async ({ member }) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries(CURRENT_MEMBER_KEY);

      // Snapshot the previous value
      const previousMember =
        queryClient.getQueryData<MemberRecord>(CURRENT_MEMBER_KEY);

      // Optimistically update to the new value
      queryClient.setQueryData(
        CURRENT_MEMBER_KEY,
        previousMember?.merge(member),
      );

      // Return a context object with the snapshotted value
      return { previousMember };
    },
    onSuccess: () => {
      notifier?.({
        type: editMemberRoutine.SUCCESS,
        payload: { message: SUCCESS_MESSAGES.EDIT_MEMBER },
      });
    },
    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (error, _, context) => {
      notifier?.({ type: editMemberRoutine.FAILURE, payload: { error } });
      queryClient.setQueryData(CURRENT_MEMBER_KEY, context.previousMember);
    },
    // Always refetch after error or success:
    onSettled: () => {
      // invalidate all queries
      queryClient.invalidateQueries(CURRENT_MEMBER_KEY);
    },
  });
  const useEditMember = () =>
    useMutation<void, unknown, { id: UUID; extra: MemberExtra }>(EDIT_MEMBER);

  // this mutation is used for its callback and invalidate the keys
  /**
   * @param {UUID} id parent item id wher the file is uploaded in
   * @param {error} [error] error occured during the file uploading
   */
  queryClient.setMutationDefaults(UPLOAD_AVATAR, {
    mutationFn: async ({ error, data } = {}) => {
      throwIfArrayContainsErrorOrReturn(data);
      if (error) throw new Error(JSON.stringify(error));
    },
    onSuccess: () => {
      notifier?.({
        type: uploadAvatarRoutine.SUCCESS,
        payload: { message: SUCCESS_MESSAGES.UPLOAD_AVATAR },
      });
    },
    onError: (_error, { error }) => {
      notifier?.({ type: uploadAvatarRoutine.FAILURE, payload: { error } });
    },
    onSettled: (_data, _error, { id }) => {
      Object.values(ThumbnailSize).forEach((size) => {
        const key1 = buildAvatarKey({ replyUrl: true, id, size });
        queryClient.invalidateQueries(key1);
        const key2 = buildAvatarKey({ replyUrl: false, id, size });
        queryClient.invalidateQueries(key2);
      });
    },
  });
  const useUploadAvatar = () =>
    useMutation<void, unknown, { error?: any; data?: any; id: UUID }>(
      UPLOAD_AVATAR,
    );

  return {
    useDeleteMember,
    useUploadAvatar,
    useEditMember,
  };
};

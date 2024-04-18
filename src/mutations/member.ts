import { CompleteMember, Password, UUID } from '@graasp/sdk';
import { SUCCESS_MESSAGES } from '@graasp/translations';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import * as AuthApi from '../api/authentication.js';
import { throwIfArrayContainsErrorOrReturn } from '../api/axios.js';
import * as Api from '../api/member.js';
import { memberKeys } from '../config/keys.js';
import {
  deleteMemberRoutine,
  editMemberRoutine,
  updatePasswordRoutine,
  uploadAvatarRoutine,
} from '../routines/member.js';
import { QueryClientConfig } from '../types.js';

export default (queryConfig: QueryClientConfig) => {
  const { notifier } = queryConfig;

  const useDeleteMember = () => {
    const queryClient = useQueryClient();
    return useMutation(
      (payload: { id: UUID }) =>
        Api.deleteMember(payload, queryConfig).then(() =>
          AuthApi.signOut(queryConfig),
        ),
      {
        onSuccess: () => {
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
          queryClient.setQueryData(memberKeys.current().content, undefined);
        },
        // If the mutation fails, use the context returned from onMutate to roll back
        onError: (error: Error, _args, _context) => {
          notifier?.({ type: deleteMemberRoutine.FAILURE, payload: { error } });
        },
      },
    );
  };

  // suppose you can only edit yourself
  const useEditMember = () => {
    const queryClient = useQueryClient();
    return useMutation(
      (payload: {
        id: string;
        name?: string;
        enableSaveActions?: boolean;
        extra?: CompleteMember['extra'];
      }) => Api.editMember(payload, queryConfig),
      {
        onMutate: async (member) => {
          // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
          await queryClient.cancelQueries(memberKeys.current().content);

          // Snapshot the previous value
          const previousMember = queryClient.getQueryData<CompleteMember>(
            memberKeys.current().content,
          );

          // Optimistically update to the new value
          const newMember = previousMember;
          if (newMember) {
            if (member.name) {
              newMember.name = member.name.trim();
            }
            if (typeof member.enableSaveActions === 'boolean') {
              newMember.enableSaveActions = member.enableSaveActions;
            }
            if (member.extra) {
              newMember.extra = member.extra;
            }
            queryClient.setQueryData(memberKeys.current().content, newMember);
          }

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
        onError: (error: Error, _, context) => {
          notifier?.({ type: editMemberRoutine.FAILURE, payload: { error } });
          queryClient.setQueryData(
            memberKeys.current().content,
            context?.previousMember,
          );
        },
        // Always refetch after error or success:
        onSettled: () => {
          // invalidate all queries
          queryClient.invalidateQueries(memberKeys.current().content);
        },
      },
    );
  };

  // this mutation is used for its callback and invalidate the keys
  /**
   * @param {UUID} id parent item id wher the file is uploaded in
   * @param {error} [error] error occured during the file uploading
   */
  const useUploadAvatar = () => {
    const queryClient = useQueryClient();
    return useMutation(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      async ({ error, data }: { error?: any; data?: any; id: UUID }) => {
        throwIfArrayContainsErrorOrReturn(data);
        if (error) throw new Error(JSON.stringify(error));
      },
      {
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
          queryClient.invalidateQueries(memberKeys.single(id).allAvatars);
        },
      },
    );
  };

  /**  mutation to update member password. suppose only you can edit yourself
   * @param {Password} password new password that user wants to set
   * @param {Password} currentPassword current password already stored
   */
  const useUpdatePassword = () =>
    useMutation(
      (payload: { password: Password; currentPassword: Password }) =>
        Api.updatePassword(payload, queryConfig),
      {
        onSuccess: () => {
          notifier?.({
            type: updatePasswordRoutine.SUCCESS,
            payload: { message: SUCCESS_MESSAGES.UPDATE_PASSWORD },
          });
        },
        onError: (error: Error) => {
          notifier?.({
            type: updatePasswordRoutine.FAILURE,
            payload: { error },
          });
        },
      },
    );

  return {
    useDeleteMember,
    useUploadAvatar,
    useEditMember,
    useUpdatePassword,
  };
};

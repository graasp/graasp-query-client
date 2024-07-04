import { CompleteMember, Password, UUID } from '@graasp/sdk';
import { SUCCESS_MESSAGES } from '@graasp/translations';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { throwIfArrayContainsErrorOrReturn } from '../api/axios.js';
import { memberKeys } from '../keys.js';
import { QueryClientConfig } from '../types.js';
import * as Api from './api.js';
import {
  deleteCurrentMemberRoutine,
  deleteMemberRoutine,
  editMemberRoutine,
  updateEmailRoutine,
  updatePasswordRoutine,
  uploadAvatarRoutine,
} from './routines.js';

export default (queryConfig: QueryClientConfig) => {
  const { notifier } = queryConfig;

  /**
   * @deprecated Please use the `useDeleteCurrentMember` instead
   */
  const useDeleteMember = () => {
    const queryClient = useQueryClient();
    return useMutation(
      (payload: { id: UUID }) => Api.deleteMember(payload, queryConfig),
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

  const useDeleteCurrentMember = () => {
    const queryClient = useQueryClient();
    return useMutation(() => Api.deleteCurrentMember(queryConfig), {
      onSuccess: () => {
        notifier?.({
          type: deleteCurrentMemberRoutine.SUCCESS,
          payload: { message: SUCCESS_MESSAGES.DELETE_MEMBER },
        });

        queryClient.resetQueries();

        // Update when the server confirmed the logout, instead optimistically updating the member
        // This prevents logout loop (redirect to logout -> still cookie -> logs back in)
        queryClient.setQueryData(memberKeys.current().content, undefined);
      },
      // If the mutation fails, use the context returned from onMutate to roll back
      onError: (error: Error, _args, _context) => {
        notifier?.({
          type: deleteCurrentMemberRoutine.FAILURE,
          payload: { error },
        });
      },
    });
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
   * @param {UUID} id parent item id where the file is uploaded in
   * @param {error} [error] error occurred during the file uploading
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

  /**
   * Mutation to update the member password
   * @param {Password} password new password that user wants to set
   * @param {Password} currentPassword current password already stored, needs to match old password
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

  /**
   * Mutation to create a member password
   * @param {Password} password new password to set on current member
   */
  const useCreatePassword = () =>
    useMutation(
      (payload: { password: Password }) =>
        Api.createPassword(payload, queryConfig),
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

  const useUpdateMemberEmail = () =>
    useMutation((newEmail: string) => Api.updateEmail(newEmail, queryConfig), {
      onSuccess: () => {
        notifier?.({
          type: updateEmailRoutine.SUCCESS,
          payload: { message: SUCCESS_MESSAGES.UPDATE_EMAIL },
        });
      },
      onError: (error: Error) => {
        notifier?.({
          type: updateEmailRoutine.FAILURE,
          payload: { error },
        });
      },
    });

  const useValidateEmailUpdate = () =>
    useMutation(
      (token: string) => Api.validateEmailUpdate(token, queryConfig),
      {
        onSuccess: () => {
          notifier?.({
            type: updateEmailRoutine.SUCCESS,
            payload: { message: SUCCESS_MESSAGES.VALIDATE_EMAIL },
          });
        },
        onError: (error: Error) => {
          notifier?.({
            type: updateEmailRoutine.FAILURE,
            payload: { error },
          });
        },
      },
    );

  return {
    useDeleteMember,
    useDeleteCurrentMember,
    useUploadAvatar,
    useEditMember,
    useUpdatePassword,
    useCreatePassword,
    useUpdateMemberEmail,
    useValidateEmailUpdate,
  };
};

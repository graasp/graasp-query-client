import {
  CompleteMember,
  CurrentAccount,
  MAX_THUMBNAIL_SIZE,
  Password,
} from '@graasp/sdk';
import { FAILURE_MESSAGES, SUCCESS_MESSAGES } from '@graasp/translations';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosProgressEvent } from 'axios';

import { memberKeys } from '../keys.js';
import { QueryClientConfig } from '../types.js';
import * as Api from './api.js';
import {
  deleteCurrentMemberRoutine,
  editMemberRoutine,
  exportMemberDataRoutine,
  updateEmailRoutine,
  updatePasswordRoutine,
  uploadAvatarRoutine,
} from './routines.js';

export default (queryConfig: QueryClientConfig) => {
  const { notifier } = queryConfig;

  const useDeleteCurrentMember = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: () => Api.deleteCurrentMember(queryConfig),
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
  const useEditCurrentMember = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (payload: {
        name?: string;
        enableSaveActions?: boolean;
        extra?: CompleteMember['extra'];
      }) => Api.editCurrentMember(payload, queryConfig),
      onMutate: async (member) => {
        // Cancel any outgoing refetch (so they don't overwrite our optimistic update)
        await queryClient.cancelQueries({
          queryKey: memberKeys.current().content,
        });

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
        queryClient.invalidateQueries({
          queryKey: memberKeys.current().content,
        });
      },
    });
  };

  /**
   * Uploads the member profile picture
   */
  const useUploadAvatar = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (args: {
        file: Blob;
        onUploadProgress?: (progressEvent: AxiosProgressEvent) => void;
      }) => {
        if (args.file.size > MAX_THUMBNAIL_SIZE) {
          throw new Error(FAILURE_MESSAGES.UPLOAD_BIG_FILES);
        }

        return Api.uploadAvatar(args, queryConfig);
      },
      onSuccess: () => {
        // get memberId from query data
        const memberId = queryClient.getQueryData<CurrentAccount>(
          memberKeys.current().content,
        )?.id;
        if (memberId) {
          // if we know the memberId we invalidate the avatars to refresh the queries
          queryClient.invalidateQueries({
            queryKey: memberKeys.single(memberId).allAvatars,
          });
        }
        notifier?.({
          type: uploadAvatarRoutine.SUCCESS,
          payload: { message: SUCCESS_MESSAGES.UPLOAD_AVATAR },
        });
      },
      onError: (error) => {
        notifier?.({ type: uploadAvatarRoutine.FAILURE, payload: { error } });
      },
    });
  };

  /**
   * Mutation to update the member password
   * @param {Password} password new password that user wants to set
   * @param {Password} currentPassword current password already stored, needs to match old password
   */
  const useUpdatePassword = () =>
    useMutation({
      mutationFn: (payload: {
        password: Password;
        currentPassword: Password;
      }) => Api.updatePassword(payload, queryConfig),
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
    });

  /**
   * Mutation to create a member password
   * @param {Password} password new password to set on current member
   */
  const useCreatePassword = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (payload: { password: Password }) =>
        Api.createPassword(payload, queryConfig),
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
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: memberKeys.current().passwordStatus,
        });
      },
    });
  };

  const useUpdateMemberEmail = () =>
    useMutation({
      mutationFn: (newEmail: string) => Api.updateEmail(newEmail, queryConfig),
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
    useMutation({
      mutationFn: (token: string) =>
        Api.validateEmailUpdate(token, queryConfig),
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
    });

  const useExportMemberData = () =>
    useMutation({
      mutationFn: () => Api.exportMemberData(queryConfig),
      onSuccess: () => {
        notifier?.({
          type: exportMemberDataRoutine.SUCCESS,
        });
      },
      onError: (error: Error) => {
        notifier?.({
          type: exportMemberDataRoutine.FAILURE,
          payload: { error },
        });
      },
    });
  return {
    useDeleteCurrentMember,
    useUploadAvatar,
    useEditCurrentMember,
    /**
     * @deprecated use useEditCurrentMember
     */
    useEditMember: useEditCurrentMember,
    useUpdatePassword,
    useCreatePassword,
    useUpdateMemberEmail,
    useValidateEmailUpdate,
    useExportMemberData,
  };
};

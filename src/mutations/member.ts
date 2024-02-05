import { CompleteMember, MemberExtra, UUID } from '@graasp/sdk';
import { SUCCESS_MESSAGES } from '@graasp/translations';

import { useMutation, useQueryClient } from 'react-query';

import * as Api from '../api';
import { throwIfArrayContainsErrorOrReturn } from '../api/axios';
import { memberKeys } from '../config/keys';
import {
  deleteMemberRoutine,
  editMemberRoutine,
  uploadAvatarRoutine,
} from '../routines';
import { QueryClientConfig } from '../types';

export default (queryConfig: QueryClientConfig) => {
  const { notifier } = queryConfig;

  const useDeleteMember = () => {
    const queryClient = useQueryClient();
    return useMutation(
      (payload: { id: UUID }) =>
        Api.deleteMember(payload, queryConfig).then(() =>
          Api.signOut(queryConfig),
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
      (payload: { id: string; name?: string; extra?: MemberExtra }) =>
        Api.editMember(payload, queryConfig),
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
              newMember.name = member.name;
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

  return {
    useDeleteMember,
    useUploadAvatar,
    useEditMember,
  };
};

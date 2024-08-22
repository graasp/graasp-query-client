import { Invitation, PermissionLevel, UUID } from '@graasp/sdk';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import * as Api from '../api/invitation.js';
import { itemKeys } from '../keys.js';
import {
  deleteInvitationRoutine,
  patchInvitationRoutine,
  postInvitationsRoutine,
  resendInvitationRoutine,
} from '../routines/invitation.js';
import { NewInvitation, QueryClientConfig } from '../types.js';

export default (queryConfig: QueryClientConfig) => {
  const usePostInvitations = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (payload: { itemId: UUID; invitations: NewInvitation[] }) =>
        Api.postInvitations(payload, queryConfig),
      onSuccess: () => {
        queryConfig.notifier?.({
          type: postInvitationsRoutine.SUCCESS,
        });
      },
      onError: (error: Error) => {
        queryConfig.notifier?.({
          type: postInvitationsRoutine.FAILURE,
          payload: { error },
        });
      },
      onSettled: (_data, _error, { itemId }) => {
        queryClient.invalidateQueries({
          queryKey: itemKeys.single(itemId).invitation,
        });
      },
    });
  };

  const usePatchInvitation = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: ({
        itemId,
        id,
        permission,
        name,
      }: {
        itemId: UUID;
        id: UUID;
        permission: PermissionLevel;
        name?: string;
      }) =>
        Api.patchInvitation({ itemId, id }, { permission, name }, queryConfig),
      //     onMutate: async ({ itemId, id, permission, name }) => {
      //       const key = buildItemInvitationsKey(itemId);

      //       const prevValue = queryClient.getQueryData<List<Invitation>>(key);

      //       // update invitation from list
      //       if (prevValue) {
      //         queryClient.setQueryData(
      //           key,
      //           prevValue.update((arr) => {
      //             const idx = arr.findIndex(({ id: thisId }) => thisId === id)
      //             const prev = arr.get(idx)
      //             const updated = prev.
      //             arr.update(idx, inv => { ...inv,
      //               permission: permission ?? inv.permission,
      //                name: name ?? inv.name })

      //           }),
      //         );
      // }
      // return { invitations: prevValue };
      //     },
      onSuccess: () => {
        queryConfig.notifier?.({
          type: patchInvitationRoutine.SUCCESS,
        });
      },
      onError: (error: Error) => {
        queryConfig.notifier?.({
          type: patchInvitationRoutine.FAILURE,
          payload: { error },
        });
      },
      onSettled: (_data, _error, { itemId }) => {
        queryClient.invalidateQueries({
          queryKey: itemKeys.single(itemId).invitation,
        });
      },
    });
  };

  const useDeleteInvitation = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (payload: { id: UUID; itemId: UUID }) =>
        Api.deleteInvitation(payload, queryConfig),
      onMutate: async ({ id, itemId }: { id: UUID; itemId: UUID }) => {
        const key = itemKeys.single(itemId).invitation;

        const prevValue = queryClient.getQueryData<Invitation[]>(key);

        // remove invitation from list
        if (prevValue) {
          queryClient.setQueryData(
            key,
            prevValue.filter(({ id: iId }) => iId !== id),
          );
          return { invitations: prevValue };
        }
        return {};
      },
      onSuccess: () => {
        queryConfig.notifier?.({
          type: deleteInvitationRoutine.SUCCESS,
        });
      },
      onError: (error: Error, { itemId }, context) => {
        const key = itemKeys.single(itemId).invitation;
        queryClient.setQueryData(key, context?.invitations);
        queryConfig.notifier?.({
          type: deleteInvitationRoutine.FAILURE,
          payload: { error },
        });
      },
      onSettled: (_data, _error, { itemId }) => {
        queryClient.invalidateQueries({
          queryKey: itemKeys.single(itemId).invitation,
        });
      },
    });
  };

  const useResendInvitation = () =>
    useMutation({
      mutationFn: (payload: { id: UUID; itemId: UUID }) =>
        Api.resendInvitation(payload, queryConfig),
      onSuccess: () => {
        queryConfig.notifier?.({
          type: resendInvitationRoutine.SUCCESS,
        });
      },
      onError: (error: Error) => {
        queryConfig.notifier?.({
          type: resendInvitationRoutine.FAILURE,
          payload: { error },
        });
      },
    });

  return {
    useResendInvitation,
    useDeleteInvitation,
    usePatchInvitation,
    usePostInvitations,
  };
};

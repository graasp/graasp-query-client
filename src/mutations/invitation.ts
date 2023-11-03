import { Invitation, PermissionLevel, UUID } from '@graasp/sdk';

import { useMutation, useQueryClient } from 'react-query';

import {
  deleteInvitation,
  patchInvitation,
  postInvitations,
  resendInvitation,
} from '../api';
import { throwIfArrayContainsErrorOrReturn } from '../api/axios';
import { buildItemInvitationsKey } from '../config/keys';
import {
  deleteInvitationRoutine,
  patchInvitationRoutine,
  postInvitationsRoutine,
  resendInvitationRoutine,
} from '../routines';
import { NewInvitation, QueryClientConfig } from '../types';

export default (queryConfig: QueryClientConfig) => {
  const usePostInvitations = () => {
    const queryClient = useQueryClient();
    return useMutation(
      (payload: { itemId: UUID; invitations: NewInvitation[] }) =>
        postInvitations(payload, queryConfig).then((invitations) => {
          throwIfArrayContainsErrorOrReturn(invitations);
          return invitations;
        }),
      {
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
          queryClient.invalidateQueries(buildItemInvitationsKey(itemId));
        },
      },
    );
  };

  const usePatchInvitation = () => {
    const queryClient = useQueryClient();
    return useMutation(
      ({
        itemId,
        id,
        permission,
        name,
      }: {
        itemId: UUID;
        id: UUID;
        permission: PermissionLevel;
        name?: string;
      }) => patchInvitation({ itemId, id }, { permission, name }, queryConfig),
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
      {
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
          queryClient.invalidateQueries(buildItemInvitationsKey(itemId));
        },
      },
    );
  };

  const useDeleteInvitation = () => {
    const queryClient = useQueryClient();
    return useMutation(
      (payload: { id: UUID; itemId: UUID }) =>
        deleteInvitation(payload, queryConfig),
      {
        onMutate: async ({ id, itemId }: { id: UUID; itemId: UUID }) => {
          const key = buildItemInvitationsKey(itemId);

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
          const key = buildItemInvitationsKey(itemId);
          queryClient.setQueryData(key, context?.invitations);
          queryConfig.notifier?.({
            type: deleteInvitationRoutine.FAILURE,
            payload: { error },
          });
        },
        onSettled: (_data, _error, { itemId }) => {
          queryClient.invalidateQueries(buildItemInvitationsKey(itemId));
        },
      },
    );
  };

  const useResendInvitation = () =>
    useMutation(
      (payload: { id: UUID; itemId: UUID }) =>
        resendInvitation(payload, queryConfig),
      {
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
      },
    );

  return {
    useResendInvitation,
    useDeleteInvitation,
    usePatchInvitation,
    usePostInvitations,
  };
};

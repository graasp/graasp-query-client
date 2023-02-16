import { List } from 'immutable';
import { QueryClient } from 'react-query';

import { InvitationRecord } from '@graasp/sdk/frontend';

import {
  deleteInvitation,
  patchInvitation,
  postInvitations,
  resendInvitation,
} from '../api';
import { throwIfArrayContainsErrorOrReturn } from '../api/axios';
import { MUTATION_KEYS, buildItemInvitationsKey } from '../config/keys';
import {
  deleteInvitationRoutine,
  patchInvitationRoutine,
  postInvitationsRoutine,
  resendInvitationRoutine,
} from '../routines';
import { QueryClientConfig } from '../types';

const {
  POST_INVITATIONS,
  DELETE_INVITATION,
  PATCH_INVITATION,
  RESEND_INVITATION,
} = MUTATION_KEYS;

export default (queryClient: QueryClient, queryConfig: QueryClientConfig) => {
  queryClient.setMutationDefaults(POST_INVITATIONS, {
    mutationFn: (payload) =>
      postInvitations(payload, queryConfig).then((invitations) => {
        throwIfArrayContainsErrorOrReturn(invitations);
        return invitations;
      }),
    onSuccess: () => {
      queryConfig.notifier?.({
        type: postInvitationsRoutine.SUCCESS,
      });
    },
    onError: (error) => {
      queryConfig.notifier?.({
        type: postInvitationsRoutine.FAILURE,
        payload: { error },
      });
    },
    onSettled: (_data, _error, { itemId }) => {
      queryClient.invalidateQueries(buildItemInvitationsKey(itemId));
    },
  });
  queryClient.setMutationDefaults(PATCH_INVITATION, {
    mutationFn: ({ itemId, id, permission, name }) =>
      patchInvitation({ itemId, id }, { permission, name }, queryConfig),
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
    onError: (error) => {
      queryConfig.notifier?.({
        type: patchInvitationRoutine.FAILURE,
        payload: { error },
      });
    },
    onSettled: (_data, _error, { itemId }) => {
      queryClient.invalidateQueries(buildItemInvitationsKey(itemId));
    },
  });

  queryClient.setMutationDefaults(DELETE_INVITATION, {
    mutationFn: (payload) => deleteInvitation(payload, queryConfig),
    onMutate: async ({ id, itemId }) => {
      const key = buildItemInvitationsKey(itemId);

      const prevValue = queryClient.getQueryData<List<InvitationRecord>>(key);

      // remove invitation from list
      if (prevValue) {
        queryClient.setQueryData(
          key,
          prevValue.filter(({ id: iId }) => iId !== id),
        );
      }
      return { invitations: prevValue };
    },
    onSuccess: () => {
      queryConfig.notifier?.({
        type: deleteInvitationRoutine.SUCCESS,
      });
    },
    onError: (error, { itemId }, context) => {
      const key = buildItemInvitationsKey(itemId);
      queryClient.setQueryData(key, context.invitations);
      queryConfig.notifier?.({
        type: deleteInvitationRoutine.FAILURE,
        payload: { error },
      });
    },
    onSettled: (_data, _error, { itemId }) => {
      queryClient.invalidateQueries(buildItemInvitationsKey(itemId));
    },
  });

  queryClient.setMutationDefaults(RESEND_INVITATION, {
    mutationFn: (payload) => resendInvitation(payload, queryConfig),
    onSuccess: () => {
      queryConfig.notifier?.({
        type: resendInvitationRoutine.SUCCESS,
      });
    },
    onError: (error) => {
      queryConfig.notifier?.({
        type: resendInvitationRoutine.FAILURE,
        payload: { error },
      });
    },
  });
};

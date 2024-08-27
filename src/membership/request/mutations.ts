import { Member, UUID } from '@graasp/sdk';
import { SUCCESS_MESSAGES } from '@graasp/translations';

import { useMutation } from '@tanstack/react-query';

import { QueryClientConfig } from '../../types.js';
import { deleteMembershipRequest, requestMembership } from './api.js';
import {
  deleteMembershipRequestRoutine,
  requestMembershipRoutine,
} from './routines.js';

export default (queryConfig: QueryClientConfig) => {
  const { notifier } = queryConfig;

  const useRequestMembership = () => {
    return useMutation(
      (payload: { id: UUID }) => requestMembership(payload, queryConfig),
      {
        onSuccess: () => {
          notifier?.({
            type: requestMembershipRoutine.SUCCESS,
            payload: { message: SUCCESS_MESSAGES.REQUEST_MEMBERSHIP },
          });
        },
        // If the mutation fails, use the context returned from onMutate to roll back
        onError: (error: Error, _args, _context) => {
          notifier?.({
            type: requestMembershipRoutine.FAILURE,
            payload: { error },
          });
        },
      },
    );
  };
  const useDeleteMembershipRequest = () => {
    return useMutation(
      (payload: { itemId: UUID; memberId: Member['id'] }) =>
        deleteMembershipRequest(payload, queryConfig),
      {
        onSuccess: () => {
          notifier?.({
            type: deleteMembershipRequestRoutine.SUCCESS,
            payload: { message: SUCCESS_MESSAGES.DELETE_MEMBERSHIP_REQUEST },
          });
        },
        // If the mutation fails, use the context returned from onMutate to roll back
        onError: (error: Error, _args, _context) => {
          notifier?.({
            type: deleteMembershipRequestRoutine.FAILURE,
            payload: { error },
          });
        },
      },
    );
  };
  return { useRequestMembership, useDeleteMembershipRequest };
};

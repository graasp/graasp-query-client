import { FolderItemFactory, HttpMethod, Invitation } from '@graasp/sdk';

import { act } from '@testing-library/react';
import { StatusCodes } from 'http-status-codes';
import nock from 'nock';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  OK_RESPONSE,
  UNAUTHORIZED_RESPONSE,
  buildInvitation,
  buildMockInvitations,
} from '../../test/constants.js';
import { mockMutation, setUpTest, waitForMutation } from '../../test/utils.js';
import { itemKeys } from '../keys.js';
import {
  buildDeleteInvitationRoute,
  buildPatchInvitationRoute,
  buildPostInvitationsRoute,
  buildResendInvitationRoute,
} from '../routes.js';
import {
  deleteInvitationRoutine,
  patchInvitationRoutine,
  postInvitationsRoutine,
  resendInvitationRoutine,
} from '../routines/invitation.js';

const item = FolderItemFactory();
const itemId = item.id;

const defaultInvitations = buildMockInvitations(itemId);

describe('Invitations Mutations', () => {
  const mockedNotifier = vi.fn();
  const { wrapper, queryClient, mutations } = setUpTest({
    notifier: mockedNotifier,
  });

  afterEach(() => {
    queryClient.clear();
    nock.cleanAll();
  });

  describe('usePostInvitations', () => {
    const mutation = mutations.usePostInvitations;
    const key = itemKeys.single(itemId).invitation;
    const route = `/${buildPostInvitationsRoute(itemId)}`;

    it('Invite with one email', async () => {
      const newInvitation = buildInvitation({ item, email: 'c' });

      // set data in cache
      queryClient.setQueryData(key, defaultInvitations);

      const response = OK_RESPONSE;

      const endpoints = [
        {
          response,
          method: HttpMethod.Post,
          route,
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        mockedMutation.mutate({ itemId, invitations: [newInvitation] });
        await waitForMutation();
      });

      // check memberships invalidation
      const data = queryClient.getQueryState(key);
      expect(data?.isInvalidated).toBeTruthy();
    });

    it('Invite with multiple emails', async () => {
      const newInvitations = [
        buildInvitation({ item, email: 'c' }),
        buildInvitation({ item, email: 'd' }),
        buildInvitation({ item, email: 'e' }),
      ];

      // set data in cache
      queryClient.setQueryData(key, defaultInvitations);

      const response = OK_RESPONSE;

      const endpoints = [
        {
          response,
          method: HttpMethod.Post,
          route,
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        mockedMutation.mutate({ itemId, invitations: newInvitations });
        await waitForMutation();
      });

      // check memberships invalidation
      const data = queryClient.getQueryState(key);
      expect(data?.isInvalidated).toBeTruthy();
    });

    it('Unauthorized to post invitation', async () => {
      const newInvitation = buildInvitation({ item, email: 'c' });

      // set data in cache
      queryClient.setQueryData(key, defaultInvitations);

      const endpoints = [
        {
          response: UNAUTHORIZED_RESPONSE,
          statusCode: StatusCodes.UNAUTHORIZED,
          method: HttpMethod.Post,
          route,
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        mockedMutation.mutate({ itemId, invitations: [newInvitation] });
        await waitForMutation();
      });

      // check memberships invalidation
      const data = queryClient.getQueryState(key);
      expect(data?.isInvalidated).toBeTruthy();
    });

    it('Notify if one error exists in returned value post invitation', async () => {
      const newInvitation = buildInvitation({ item, email: 'c' });
      const newInvitationRecord = buildInvitation({
        item,
        email: 'c',
      });

      // set data in cache
      queryClient.setQueryData(key, defaultInvitations);

      const endpoints = [
        {
          response: [newInvitationRecord, UNAUTHORIZED_RESPONSE],
          method: HttpMethod.Post,
          route,
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        mockedMutation.mutate({ itemId, invitations: [newInvitation] });
        await waitForMutation();
      });

      // check memberships invalidation
      const data = queryClient.getQueryState(key);
      expect(data?.isInvalidated).toBeTruthy();

      // check notification trigger
      expect(mockedNotifier).toHaveBeenCalledWith({
        type: postInvitationsRoutine.FAILURE,
        payload: expect.anything(),
      });
    });
  });

  describe('usePatchInvitation', () => {
    const mutation = mutations.usePatchInvitation;
    const key = itemKeys.single(itemId).invitation;
    const newInvitation = buildInvitation({
      item,
      email: 'c',
      name: 'newname',
    });
    const route = `/${buildPatchInvitationRoute({
      itemId,
      id: newInvitation.id,
    })}`;

    it('Patch one invitation successfully', async () => {
      // set data in cache
      queryClient.setQueryData(key, defaultInvitations);

      const response = OK_RESPONSE;

      const endpoints = [
        {
          response,
          method: HttpMethod.Patch,
          route,
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        mockedMutation.mutate({ ...newInvitation, itemId });
        await waitForMutation();
      });

      // check memberships invalidation
      const data = queryClient.getQueryState(key);
      expect(data?.isInvalidated).toBeTruthy();
      expect(mockedNotifier).toHaveBeenCalledWith({
        type: patchInvitationRoutine.SUCCESS,
      });
    });

    it('Unauthorized to patch invitation', async () => {
      // set data in cache
      queryClient.setQueryData(key, defaultInvitations);

      const endpoints = [
        {
          response: UNAUTHORIZED_RESPONSE,
          statusCode: StatusCodes.UNAUTHORIZED,
          method: HttpMethod.Patch,
          route,
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        mockedMutation.mutate({ ...newInvitation, itemId });
        await waitForMutation();
      });

      // check memberships invalidation
      const data = queryClient.getQueryState(key);
      expect(data?.isInvalidated).toBeTruthy();
      expect(mockedNotifier).toHaveBeenCalledWith(
        expect.objectContaining({
          type: patchInvitationRoutine.FAILURE,
        }),
      );
    });
  });

  describe('useDeleteInvitation', () => {
    const mutation = mutations.useDeleteInvitation;
    const key = itemKeys.single(itemId).invitation;
    const invitationToDelete = buildInvitation({ item });
    const invitationToDeleteRecord = buildInvitation({
      item,
    });
    const route = `/${buildDeleteInvitationRoute({
      itemId,
      id: invitationToDelete.id,
    })}`;

    it('Delete one invitation successfully', async () => {
      // set data in cache
      queryClient.setQueryData(key, [
        ...defaultInvitations,
        invitationToDeleteRecord,
      ]);

      const response = OK_RESPONSE;

      const endpoints = [
        {
          response,
          method: HttpMethod.Delete,
          route,
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        mockedMutation.mutate({ id: invitationToDelete.id, itemId });
        await waitForMutation();
      });

      // check memberships invalidation
      const state = queryClient.getQueryState(key);
      expect(state?.isInvalidated).toBeTruthy();
      const data = queryClient.getQueryData<Invitation[]>(key);
      expect(data).toBeTruthy();
      expect(data?.find(({ id }) => id === invitationToDelete.id)).toBeFalsy();
      expect(mockedNotifier).toHaveBeenCalledWith({
        type: deleteInvitationRoutine.SUCCESS,
      });
    });

    it('Unauthorized to delete invitation', async () => {
      // set data in cache
      queryClient.setQueryData(key, [
        ...defaultInvitations,
        invitationToDeleteRecord,
      ]);

      const endpoints = [
        {
          response: UNAUTHORIZED_RESPONSE,
          statusCode: StatusCodes.UNAUTHORIZED,
          method: HttpMethod.Delete,
          route,
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        mockedMutation.mutate({ id: invitationToDelete.id, itemId });
        await waitForMutation();
      });

      // check memberships invalidation
      const state = queryClient.getQueryState(key);
      expect(state?.isInvalidated).toBeTruthy();
      const data = queryClient.getQueryData<Invitation[]>(key);
      expect(data).toBeTruthy();
      expect(data?.find(({ id }) => id === invitationToDelete.id)).toBeTruthy();
      expect(mockedNotifier).toHaveBeenCalledWith(
        expect.objectContaining({
          type: deleteInvitationRoutine.FAILURE,
        }),
      );
    });
  });

  describe('useResendInvitation', () => {
    const mutation = mutations.useResendInvitation;
    const invitation = buildInvitation({ item });
    const route = `/${buildResendInvitationRoute({
      itemId,
      id: invitation.id,
    })}`;

    it('Resend invitation mail successfully', async () => {
      const response = OK_RESPONSE;

      const endpoints = [
        {
          response,
          method: HttpMethod.Post,
          route,
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        mockedMutation.mutate({ id: invitation.id, itemId });
        await waitForMutation();
      });

      expect(mockedNotifier).toHaveBeenCalledWith({
        type: resendInvitationRoutine.SUCCESS,
      });
    });

    it('Unauthorized to resend invitation', async () => {
      const endpoints = [
        {
          response: UNAUTHORIZED_RESPONSE,
          statusCode: StatusCodes.UNAUTHORIZED,
          method: HttpMethod.Post,
          route,
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        mockedMutation.mutate({ id: invitation.id, itemId });
        await waitForMutation();
      });

      expect(mockedNotifier).toHaveBeenCalledWith(
        expect.objectContaining({
          type: resendInvitationRoutine.FAILURE,
        }),
      );
    });
  });
});

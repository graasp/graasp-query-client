/* eslint-disable import/no-extraneous-dependencies */
import { act } from '@testing-library/react-hooks';
import nock from 'nock';
import Cookies from 'js-cookie';
import { StatusCodes } from 'http-status-codes';
import { List } from 'immutable';
import {
  buildDeleteInvitationRoute,
  buildPatchInvitationRoute,
  buildPostInvitationsRoute,
  buildResendInvitationRoute,
} from '../api/routes';
import { setUpTest, mockMutation, waitForMutation } from '../../test/utils';
import {
  buildInvitation,
  buildInvitationRecord,
  buildMockInvitations,
  ITEMS,
  OK_RESPONSE,
  UNAUTHORIZED_RESPONSE,
} from '../../test/constants';
import { buildItemInvitationsKey, MUTATION_KEYS } from '../config/keys';
import { REQUEST_METHODS } from '../api/utils';
import {
  deleteInvitationRoutine,
  patchInvitationRoutine,
  postInvitationsRoutine,
  resendInvitationRoutine,
} from '../routines';
import { InvitationRecord } from '../types';

jest.spyOn(Cookies, 'get').mockReturnValue({ session: 'somesession' });

const item = ITEMS.first()!;
const itemId = item.id;

const defaultInvitations = buildMockInvitations(itemId);

describe('Invitations Mutations', () => {
  const mockedNotifier = jest.fn();
  const { wrapper, queryClient, useMutation } = setUpTest({
    notifier: mockedNotifier,
  });

  afterEach(() => {
    queryClient.clear();
    nock.cleanAll();
  });

  describe(MUTATION_KEYS.POST_INVITATIONS, () => {
    const mutation = () => useMutation(MUTATION_KEYS.POST_INVITATIONS);
    const key = buildItemInvitationsKey(itemId);
    const route = `/${buildPostInvitationsRoute(itemId)}`;

    it('Invite with one email', async () => {
      const newInvitation = buildInvitation({ itemPath: itemId, email: 'c' });

      // set data in cache
      queryClient.setQueryData(key, defaultInvitations);

      const response = OK_RESPONSE;

      const endpoints = [
        {
          response,
          method: REQUEST_METHODS.POST,
          route,
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        await mockedMutation.mutate({ itemId, invitations: [newInvitation] });
        await waitForMutation();
      });

      // check memberships invalidation
      const data = queryClient.getQueryState(key);
      expect(data?.isInvalidated).toBeTruthy();
    });

    it('Invite with multiple emails', async () => {
      const newInvitations = [
        buildInvitation({ itemPath: itemId, email: 'c' }),
        buildInvitation({ itemPath: itemId, email: 'd' }),
        buildInvitation({ itemPath: itemId, email: 'e' }),
      ];

      // set data in cache
      queryClient.setQueryData(key, defaultInvitations);

      const response = OK_RESPONSE;

      const endpoints = [
        {
          response,
          method: REQUEST_METHODS.POST,
          route,
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        await mockedMutation.mutate({ itemId, invitations: newInvitations });
        await waitForMutation();
      });

      // check memberships invalidation
      const data = queryClient.getQueryState(key);
      expect(data?.isInvalidated).toBeTruthy();
    });

    it('Unauthorized to post invitation', async () => {
      const newInvitation = buildInvitation({ itemPath: itemId, email: 'c' });

      // set data in cache
      queryClient.setQueryData(key, defaultInvitations);

      const endpoints = [
        {
          response: UNAUTHORIZED_RESPONSE,
          statusCode: StatusCodes.UNAUTHORIZED,
          method: REQUEST_METHODS.POST,
          route,
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        await mockedMutation.mutate({ itemId, invitations: newInvitation });
        await waitForMutation();
      });

      // check memberships invalidation
      const data = queryClient.getQueryState(key);
      expect(data?.isInvalidated).toBeTruthy();
    });

    it('Notify if one error exists in returned value post invitation', async () => {
      const newInvitation = buildInvitation({ itemPath: itemId, email: 'c' });
      const newInvitationRecord = buildInvitationRecord({ itemPath: itemId, email: 'c' });

      // set data in cache
      queryClient.setQueryData(key, defaultInvitations);

      const endpoints = [
        {
          response: [newInvitationRecord, UNAUTHORIZED_RESPONSE],
          method: REQUEST_METHODS.POST,
          route,
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        await mockedMutation.mutate({ itemId, invitations: newInvitation });
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

  describe(MUTATION_KEYS.PATCH_INVITATION, () => {
    const mutation = () => useMutation(MUTATION_KEYS.PATCH_INVITATION);
    const key = buildItemInvitationsKey(itemId);
    const newInvitation = buildInvitation({
      itemPath: itemId,
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
          method: REQUEST_METHODS.PATCH,
          route,
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        await mockedMutation.mutate({ ...newInvitation, itemId });
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
          method: REQUEST_METHODS.PATCH,
          route,
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        await mockedMutation.mutate({ ...newInvitation, itemId });
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

  describe(MUTATION_KEYS.DELETE_INVITATION, () => {
    const mutation = () => useMutation(MUTATION_KEYS.DELETE_INVITATION);
    const key = buildItemInvitationsKey(itemId);
    const invitationToDelete = buildInvitation({ itemPath: 'itemPath' });
    const invitationToDeleteRecord = buildInvitationRecord({ itemPath: 'itemPath' });
    const route = `/${buildDeleteInvitationRoute({
      itemId,
      id: invitationToDelete.id,
    })}`;

    it('Delete one invitation successfully', async () => {
      // set data in cache
      queryClient.setQueryData(key, List([
        ...defaultInvitations,
        invitationToDeleteRecord,
      ]));

      const response = OK_RESPONSE;

      const endpoints = [
        {
          response,
          method: REQUEST_METHODS.DELETE,
          route,
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        await mockedMutation.mutate({ id: invitationToDelete.id, itemId });
        await waitForMutation();
      });

      // check memberships invalidation
      const state = queryClient.getQueryState(key);
      expect(state?.isInvalidated).toBeTruthy();
      const data = queryClient.getQueryData<List<InvitationRecord>>(key);
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
          method: REQUEST_METHODS.DELETE,
          route,
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        await mockedMutation.mutate({ id: invitationToDelete.id, itemId });
        await waitForMutation();
      });

      // check memberships invalidation
      const state = queryClient.getQueryState(key);
      expect(state?.isInvalidated).toBeTruthy();
      const data = queryClient.getQueryData<List<InvitationRecord>>(key);
      expect(data).toBeTruthy();
      expect(data?.find(({ id }) => id === invitationToDelete.id)).toBeTruthy();
      expect(mockedNotifier).toHaveBeenCalledWith(
        expect.objectContaining({
          type: deleteInvitationRoutine.FAILURE,
        }),
      );
    });
  });

  describe(MUTATION_KEYS.RESEND_INVITATION, () => {
    const mutation = () => useMutation(MUTATION_KEYS.RESEND_INVITATION);
    const invitation = buildInvitation({ itemPath: 'itemPath' });
    const route = `/${buildResendInvitationRoute({
      itemId,
      id: invitation.id,
    })}`;

    it('Resend invitation mail successfully', async () => {
      const response = OK_RESPONSE;

      const endpoints = [
        {
          response,
          method: REQUEST_METHODS.POST,
          route,
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        await mockedMutation.mutate({ id: invitation.id, itemId });
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
          method: REQUEST_METHODS.POST,
          route,
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        await mockedMutation.mutate({ id: invitation.id, itemId });
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

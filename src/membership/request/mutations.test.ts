import {
  FolderItemFactory,
  HttpMethod,
  MemberFactory,
  MembershipRequestStatus,
} from '@graasp/sdk';

import { act } from '@testing-library/react';
import { StatusCodes } from 'http-status-codes';
import nock from 'nock';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { OK_RESPONSE, UNAUTHORIZED_RESPONSE } from '../../../test/constants.js';
import {
  mockMutation,
  setUpTest,
  waitForMutation,
} from '../../../test/utils.js';
import { membershipRequestsKeys } from './keys.js';
import {
  buildDeleteMembershipRequestRoute,
  buildRequestMembershipRoute,
} from './routes.js';
import {
  deleteMembershipRequestRoutine,
  requestMembershipRoutine,
} from './routines.js';

describe('Membership Request Mutations', () => {
  const itemId = FolderItemFactory().id;

  const mockedNotifier = vi.fn();
  const { wrapper, queryClient, mutations } = setUpTest({
    notifier: mockedNotifier,
  });

  afterEach(() => {
    queryClient.clear();
    nock.cleanAll();
  });

  describe('useRequestMembership', () => {
    const route = `/${buildRequestMembershipRoute(itemId)}`;
    const mutation = mutations.useRequestMembership;

    it(`Request Membership`, async () => {
      queryClient.setQueryData(membershipRequestsKeys.single(itemId), []);
      queryClient.setQueryData(membershipRequestsKeys.own(itemId), {
        status: MembershipRequestStatus.Approved,
      });

      const endpoints = [
        { route, response: OK_RESPONSE, method: HttpMethod.Post },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        mockedMutation.mutate({ id: itemId });
        await waitForMutation();
      });

      expect(mockedNotifier).toHaveBeenCalledWith(
        expect.objectContaining({
          type: requestMembershipRoutine.SUCCESS,
        }),
      );

      expect(
        queryClient.getQueryState(membershipRequestsKeys.single(itemId))!
          .isInvalidated,
      ).toBe(true);
      expect(
        queryClient.getQueryState(membershipRequestsKeys.own(itemId))!
          .isInvalidated,
      ).toBe(true);
    });

    it(`Unauthorized`, async () => {
      queryClient.setQueryData(membershipRequestsKeys.single(itemId), []);
      queryClient.setQueryData(membershipRequestsKeys.own(itemId), {
        status: MembershipRequestStatus.Approved,
      });

      const endpoints = [
        {
          route,
          response: UNAUTHORIZED_RESPONSE,
          method: HttpMethod.Post,
          statusCode: StatusCodes.UNAUTHORIZED,
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        mockedMutation.mutate({ id: itemId });
        await waitForMutation();
      });

      expect(mockedNotifier).toHaveBeenCalledWith(
        expect.objectContaining({
          type: requestMembershipRoutine.FAILURE,
        }),
      );
      expect(
        queryClient.getQueryState(membershipRequestsKeys.single(itemId))!
          .isInvalidated,
      ).toBe(true);
      expect(
        queryClient.getQueryState(membershipRequestsKeys.own(itemId))!
          .isInvalidated,
      ).toBe(true);
    });
  });

  describe('useDeleteMembershipRequest', () => {
    const { id: memberId } = MemberFactory();
    const route = `/${buildDeleteMembershipRequestRoute({ itemId, memberId })}`;
    const mutation = mutations.useDeleteMembershipRequest;

    it(`Delete Request Membership`, async () => {
      queryClient.setQueryData(membershipRequestsKeys.single(itemId), []);
      queryClient.setQueryData(membershipRequestsKeys.own(itemId), {
        status: MembershipRequestStatus.Approved,
      });

      const endpoints = [
        { route, response: OK_RESPONSE, method: HttpMethod.Delete },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        mockedMutation.mutate({ itemId, memberId });
        await waitForMutation();
      });

      expect(mockedNotifier).toHaveBeenCalledWith(
        expect.objectContaining({
          type: deleteMembershipRequestRoutine.SUCCESS,
        }),
      );

      expect(
        queryClient.getQueryState(membershipRequestsKeys.single(itemId))!
          .isInvalidated,
      ).toBe(true);
      expect(
        queryClient.getQueryState(membershipRequestsKeys.own(itemId))!
          .isInvalidated,
      ).toBe(true);
    });

    it(`Unauthorized`, async () => {
      queryClient.setQueryData(membershipRequestsKeys.single(itemId), []);
      queryClient.setQueryData(membershipRequestsKeys.own(itemId), {
        status: MembershipRequestStatus.Approved,
      });

      const endpoints = [
        {
          route,
          response: UNAUTHORIZED_RESPONSE,
          method: HttpMethod.Delete,
          statusCode: StatusCodes.UNAUTHORIZED,
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        mockedMutation.mutate({ itemId, memberId });
        await waitForMutation();
      });

      expect(mockedNotifier).toHaveBeenCalledWith(
        expect.objectContaining({
          type: deleteMembershipRequestRoutine.FAILURE,
        }),
      );
      expect(
        queryClient.getQueryState(membershipRequestsKeys.single(itemId))!
          .isInvalidated,
      ).toBe(true);
      expect(
        queryClient.getQueryState(membershipRequestsKeys.own(itemId))!
          .isInvalidated,
      ).toBe(true);
    });
  });
});

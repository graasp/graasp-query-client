import {
  FolderItemFactory,
  HttpMethod,
  ItemMembership,
  MemberFactory,
  PermissionLevel,
} from '@graasp/sdk';
import { SUCCESS_MESSAGES } from '@graasp/translations';

import { act } from '@testing-library/react';
import { StatusCodes } from 'http-status-codes';
import nock from 'nock';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  ITEM_MEMBERSHIPS_RESPONSE,
  OK_RESPONSE,
  UNAUTHORIZED_RESPONSE,
  buildMockInvitations,
  buildResultOfData,
} from '../../test/constants.js';
import {
  Endpoint,
  mockMutation,
  setUpTest,
  waitForMutation,
} from '../../test/utils.js';
import { itemKeys } from '../keys.js';
import {
  buildDeleteItemMembershipRoute,
  buildEditItemMembershipRoute,
  buildPostInvitationsRoute,
  buildPostItemMembershipRoute,
} from '../routes.js';
import {
  deleteItemMembershipRoutine,
  editItemMembershipRoutine,
  shareItemRoutine,
} from '../routines/membership.js';

const mockedNotifier = vi.fn();
const { wrapper, queryClient, mutations } = setUpTest({
  notifier: mockedNotifier,
});

describe('Membership Mutations', () => {
  afterEach(() => {
    queryClient.clear();
    nock.cleanAll();
    vi.clearAllMocks();
  });

  const items = [
    FolderItemFactory(),
    FolderItemFactory(),
    FolderItemFactory(),
    FolderItemFactory(),
    FolderItemFactory(),
  ];
  const item = items[0];
  const itemId = item.id;
  const memberships = ITEM_MEMBERSHIPS_RESPONSE;
  const membershipsKey = itemKeys.single(itemId).memberships;
  const membershipId = memberships[0].id;
  const permission = PermissionLevel.Read;

  describe('usePostItemMembership', () => {
    const mutation = mutations.usePostItemMembership;

    const { id: accountId } = MemberFactory();

    it('Create one membership', async () => {
      const route = `/${buildPostItemMembershipRoute(itemId)}`;

      // set data in cache
      items.forEach((i) => {
        const itemKey = itemKeys.single(i.id).content;
        queryClient.setQueryData(itemKey, i);
      });
      queryClient.setQueryData(itemKeys.accessiblePage({}, {}), items);
      queryClient.setQueryData(
        itemKeys.single(itemId).memberships,
        ITEM_MEMBERSHIPS_RESPONSE,
      );

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
        mockedMutation.mutate({ id: itemId, accountId, permission });
        await waitForMutation();
      });

      // check memberships invalidation
      const data = queryClient.getQueryState(
        itemKeys.single(itemId).memberships,
      );
      expect(data?.isInvalidated).toBeTruthy();
    });

    it('Unauthorized to create an item membership', async () => {
      const route = `/${buildPostItemMembershipRoute(itemId)}`;

      // set data in cache
      items.forEach((i) => {
        const itemKey = itemKeys.single(i.id).content;
        queryClient.setQueryData(itemKey, i);
      });
      queryClient.setQueryData(itemKeys.accessiblePage({}, {}), items);
      queryClient.setQueryData(
        itemKeys.single(itemId).memberships,
        ITEM_MEMBERSHIPS_RESPONSE,
      );

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
        mockedMutation.mutate({ id: itemId, accountId, permission });
        await waitForMutation();
      });

      // check memberships invalidation
      const data = queryClient.getQueryState(
        itemKeys.single(itemId).memberships,
      );
      expect(data?.isInvalidated).toBeTruthy();
    });
  });

  describe('useEditItemMembership', () => {
    const route = `/${buildEditItemMembershipRoute(membershipId)}`;
    const mutation = mutations.useEditItemMembership;

    it('Edit item membership', async () => {
      queryClient.setQueryData(membershipsKey, memberships);

      const endpoints = [
        {
          response: {},
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
        mockedMutation.mutate({
          id: membershipId,
          permission,
          itemId,
        });
        await waitForMutation();
      });

      expect(
        queryClient.getQueryState(membershipsKey)?.isInvalidated,
      ).toBeTruthy();
      expect(mockedNotifier).toHaveBeenCalledWith({
        type: editItemMembershipRoutine.SUCCESS,
        payload: { message: SUCCESS_MESSAGES.EDIT_ITEM_MEMBERSHIP },
      });
    });

    it('Unauthorized to edit item membership', async () => {
      queryClient.setQueryData(membershipsKey, ITEM_MEMBERSHIPS_RESPONSE);

      const endpoints = [
        {
          response: UNAUTHORIZED_RESPONSE,
          method: HttpMethod.Patch,
          statusCode: StatusCodes.UNAUTHORIZED,
          route,
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        mockedMutation.mutate({ id: membershipId, permission, itemId });
        await waitForMutation();
      });

      expect(
        queryClient.getQueryState(membershipsKey)?.isInvalidated,
      ).toBeTruthy();
      expect(mockedNotifier).toHaveBeenCalledWith(
        expect.objectContaining({
          type: editItemMembershipRoutine.FAILURE,
        }),
      );
    });
  });

  describe('useDeleteItemMembership', () => {
    const route = `/${buildDeleteItemMembershipRoute(membershipId)}`;
    const mutation = mutations.useDeleteItemMembership;

    it('Delete item membership', async () => {
      queryClient.setQueryData(membershipsKey, ITEM_MEMBERSHIPS_RESPONSE);

      const endpoints = [
        {
          response: {},
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
        mockedMutation.mutate({ id: membershipId, itemId });
        await waitForMutation();
      });

      expect(
        queryClient.getQueryState(membershipsKey)?.isInvalidated,
      ).toBeTruthy();
      expect(
        queryClient.getQueryData<ItemMembership[]>(membershipsKey),
      ).toEqual(memberships.filter(({ id }) => id !== membershipId));
      expect(mockedNotifier).toHaveBeenCalledWith({
        type: deleteItemMembershipRoutine.SUCCESS,
        payload: { message: SUCCESS_MESSAGES.DELETE_ITEM_MEMBERSHIP },
      });
    });

    it('Unauthorized to delete item membership', async () => {
      queryClient.setQueryData(membershipsKey, ITEM_MEMBERSHIPS_RESPONSE);

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
        mockedMutation.mutate({ id: membershipId, itemId });
        await waitForMutation();
      });

      expect(
        queryClient.getQueryState(membershipsKey)?.isInvalidated,
      ).toBeTruthy();
      expect(
        queryClient.getQueryData<ItemMembership[]>(membershipsKey),
      ).toEqual(memberships);
      expect(mockedNotifier).toHaveBeenCalledWith(
        expect.objectContaining({
          type: deleteItemMembershipRoutine.FAILURE,
        }),
      );
    });
  });

  describe('useShareItem', () => {
    const initialInvitations = buildMockInvitations(itemId);
    const mutation = mutations.useShareItem;

    const emails = ['anna@email.com', 'bob@email.com', 'cedric@email.com'];

    it('Successfully share item with all emails', async () => {
      // set data in cache
      items.forEach((i) => {
        const itemKey = itemKeys.single(i.id).content;
        queryClient.setQueryData(itemKey, i);
      });
      queryClient.setQueryData(itemKeys.accessiblePage({}, {}), items);
      queryClient.setQueryData(
        itemKeys.single(itemId).memberships,
        ITEM_MEMBERSHIPS_RESPONSE,
      );
      queryClient.setQueryData(
        itemKeys.single(itemId).invitation,
        initialInvitations,
      );

      const endpoints = [
        {
          response: initialInvitations,
          method: HttpMethod.Post,
          route: `/${buildPostInvitationsRoute(itemId)}`,
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      const invitations = emails.map((email) => ({ email, permission }));
      await act(async () => {
        mockedMutation.mutate({ itemId, invitations });
        await waitForMutation();
      });

      // check invalidations
      const mem = queryClient.getQueryState(
        itemKeys.single(itemId).memberships,
      );
      expect(mem?.isInvalidated).toBeTruthy();
      const inv = queryClient.getQueryState(itemKeys.single(itemId).invitation);
      expect(inv?.isInvalidated).toBeTruthy();

      // check notification trigger
      expect(mockedNotifier).toHaveBeenCalledWith({
        type: shareItemRoutine.SUCCESS,
        payload: expect.anything(),
      });
    });

    it('Unauthorized to post memberships', async () => {
      // set data in cache
      items.forEach((i) => {
        const itemKey = itemKeys.single(i.id).content;
        queryClient.setQueryData(itemKey, i);
      });
      queryClient.setQueryData(itemKeys.accessiblePage({}, {}), items);
      queryClient.setQueryData(
        itemKeys.single(itemId).memberships,
        ITEM_MEMBERSHIPS_RESPONSE,
      );
      queryClient.setQueryData(
        itemKeys.single(itemId).invitation,
        initialInvitations,
      );

      const endpoints: Endpoint[] = [
        {
          response: buildResultOfData(initialInvitations),
          method: HttpMethod.Post,
          route: `/${buildPostInvitationsRoute(itemId)}`,
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      const invitations = emails.map((email) => ({ email, permission }));
      await act(async () => {
        mockedMutation.mutate({ itemId, invitations });
        await waitForMutation();
      });

      // check invalidations
      const mem = queryClient.getQueryState(
        itemKeys.single(itemId).memberships,
      );
      expect(mem?.isInvalidated).toBeTruthy();
      const inv = queryClient.getQueryState(itemKeys.single(itemId).invitation);
      expect(inv?.isInvalidated).toBeTruthy();

      // check notification trigger
      expect(mockedNotifier).toHaveBeenCalledWith(
        expect.objectContaining({ type: shareItemRoutine.SUCCESS }),
      );
    });

    it('Unauthorized to post invitations', async () => {
      // set data in cache
      items.forEach((i) => {
        const itemKey = itemKeys.single(i.id).content;
        queryClient.setQueryData(itemKey, i);
      });
      queryClient.setQueryData(itemKeys.accessiblePage({}, {}), items);
      queryClient.setQueryData(
        itemKeys.single(itemId).memberships,
        ITEM_MEMBERSHIPS_RESPONSE,
      );
      queryClient.setQueryData(
        itemKeys.single(itemId).invitation,
        initialInvitations,
      );

      const endpoints = [
        {
          response: UNAUTHORIZED_RESPONSE,
          statusCode: StatusCodes.UNAUTHORIZED,
          method: HttpMethod.Post,
          route: `/${buildPostInvitationsRoute(itemId)}`,
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      const invitations = emails.map((email) => ({ email, permission }));
      await act(async () => {
        mockedMutation.mutate({ itemId, invitations });
        await waitForMutation();
      });

      // check invalidations
      const mem = queryClient.getQueryState(
        itemKeys.single(itemId).memberships,
      );
      expect(mem?.isInvalidated).toBeTruthy();
      const inv = queryClient.getQueryState(itemKeys.single(itemId).invitation);
      expect(inv?.isInvalidated).toBeTruthy();

      // check notification trigger
      expect(mockedNotifier).toHaveBeenCalledWith(
        expect.objectContaining({ type: shareItemRoutine.FAILURE }),
      );
    });
  });
});

/* eslint-disable import/no-extraneous-dependencies */
import nock from 'nock';
import { List } from 'immutable';
import { act } from 'react-test-renderer';
import { StatusCodes } from 'http-status-codes';
import Cookies from 'js-cookie';
import { SUCCESS_MESSAGES } from '@graasp/translations';
import {
  buildMockInvitations,
  ITEMS,
  ITEM_MEMBERSHIPS_RESPONSE,
  MEMBERS_RESPONSE,
  MEMBER_RESPONSE,
  OK_RESPONSE,
  UNAUTHORIZED_RESPONSE,
} from '../../test/constants';
import { mockMutation, setUpTest, waitForMutation } from '../../test/utils';
import {
  buildDeleteItemMembershipRoute,
  buildEditItemMembershipRoute,
  buildGetMembersBy,
  buildPostInvitationsRoute,
  buildPostItemMembershipRoute,
  buildPostManyItemMembershipsRoute,
} from '../api/routes';
import { REQUEST_METHODS } from '../api/utils';
import {
  buildItemInvitationsKey,
  buildItemKey,
  buildItemMembershipsKey,
  MUTATION_KEYS,
  OWN_ITEMS_KEY,
} from '../config/keys';
import {
  deleteItemMembershipRoutine,
  editItemMembershipRoutine,
  shareItemRoutine,
} from '../routines';
import { MembershipRecord, PERMISSION_LEVELS } from '../types';

const mockedNotifier = jest.fn();
const { wrapper, queryClient, useMutation } = setUpTest({
  notifier: mockedNotifier,
});

jest.spyOn(Cookies, 'get').mockReturnValue({ session: 'somesession' });

describe('Membership Mutations', () => {
  afterEach(() => {
    queryClient.clear();
    nock.cleanAll();
    jest.clearAllMocks();
  });

  const item = ITEMS.first()!;
  const itemId = item.id;
  const memberships = ITEM_MEMBERSHIPS_RESPONSE;
  const membershipsKey = buildItemMembershipsKey(itemId);
  const membershipId = memberships.first()!.id;
  const permission = PERMISSION_LEVELS.READ;

  describe(MUTATION_KEYS.POST_ITEM_MEMBERSHIP, () => {
    const mutation = () => useMutation(MUTATION_KEYS.POST_ITEM_MEMBERSHIP);
    const { email } = MEMBER_RESPONSE;

    it('Create one membership', async () => {
      const route = `/${buildPostItemMembershipRoute(itemId)}`;

      // set data in cache
      ITEMS.forEach((i) => {
        const itemKey = buildItemKey(i.id);
        queryClient.setQueryData(itemKey, i);
      });
      queryClient.setQueryData(OWN_ITEMS_KEY, ITEMS);
      queryClient.setQueryData(
        buildItemMembershipsKey(itemId),
        ITEM_MEMBERSHIPS_RESPONSE,
      );

      const response = OK_RESPONSE;

      const endpoints = [
        {
          response: [MEMBERS_RESPONSE],
          method: REQUEST_METHODS.GET,
          route: `/${buildGetMembersBy([email])}`,
        },
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
        await mockedMutation.mutate({ id: itemId, email, permission });
        await waitForMutation();
      });

      // check memberships invalidation
      const data = queryClient.getQueryState(buildItemMembershipsKey(itemId));
      expect(data?.isInvalidated).toBeTruthy();
    });

    it('Unauthorized to create an item membership', async () => {
      const route = `/${buildPostItemMembershipRoute(itemId)}`;

      // set data in cache
      ITEMS.forEach((i) => {
        const itemKey = buildItemKey(i.id);
        queryClient.setQueryData(itemKey, i);
      });
      queryClient.setQueryData(OWN_ITEMS_KEY, ITEMS);
      queryClient.setQueryData(
        buildItemMembershipsKey(itemId),
        ITEM_MEMBERSHIPS_RESPONSE,
      );

      const endpoints = [
        {
          response: [MEMBERS_RESPONSE],
          method: REQUEST_METHODS.GET,
          route: `/${buildGetMembersBy([email])}`,
        },
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
        await mockedMutation.mutate({ id: itemId, email, permission });
        await waitForMutation();
      });

      // check memberships invalidation
      const data = queryClient.getQueryState(buildItemMembershipsKey(itemId));
      expect(data?.isInvalidated).toBeTruthy();
    });
  });

  describe(MUTATION_KEYS.EDIT_ITEM_MEMBERSHIP, () => {
    const route = `/${buildEditItemMembershipRoute(membershipId)}`;
    const mutation = () => useMutation(MUTATION_KEYS.EDIT_ITEM_MEMBERSHIP);

    it('Edit item membership', async () => {
      queryClient.setQueryData(membershipsKey, memberships);

      const endpoints = [
        {
          response: {},
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
        await mockedMutation.mutate({
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
          method: REQUEST_METHODS.PATCH,
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
        await mockedMutation.mutate({ id: membershipId, permission, itemId });
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

  describe(MUTATION_KEYS.DELETE_ITEM_MEMBERSHIP, () => {
    const route = `/${buildDeleteItemMembershipRoute(membershipId)}`;
    const mutation = () => useMutation(MUTATION_KEYS.DELETE_ITEM_MEMBERSHIP);

    it('Delete item membership', async () => {
      queryClient.setQueryData(membershipsKey, ITEM_MEMBERSHIPS_RESPONSE);

      const endpoints = [
        {
          response: {},
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
        await mockedMutation.mutate({ id: membershipId, itemId });
        await waitForMutation();
      });

      expect(
        queryClient.getQueryState(membershipsKey)?.isInvalidated,
      ).toBeTruthy();
      expect(
        queryClient.getQueryData<List<MembershipRecord>>(membershipsKey),
      ).toEqualImmutable(memberships.filter(({ id }) => id !== membershipId));
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
        await mockedMutation.mutate({ id: membershipId, itemId });
        await waitForMutation();
      });

      expect(
        queryClient.getQueryState(membershipsKey)?.isInvalidated,
      ).toBeTruthy();
      expect(
        queryClient.getQueryData<List<MembershipRecord>>(membershipsKey),
      ).toEqualImmutable(memberships);
      expect(mockedNotifier).toHaveBeenCalledWith(
        expect.objectContaining({
          type: deleteItemMembershipRoutine.FAILURE,
        }),
      );
    });
  });

  describe(MUTATION_KEYS.SHARE_ITEM, () => {
    const initialInvitations = buildMockInvitations(itemId);
    const mutation = () => useMutation(MUTATION_KEYS.SHARE_ITEM);
    const emails = ['anna@email.com', 'bob@email.com', 'cedric@email.com'];

    it('Successfully share item with all emails', async () => {
      // set data in cache
      ITEMS.forEach((i) => {
        const itemKey = buildItemKey(i.id);
        queryClient.setQueryData(itemKey, i);
      });
      queryClient.setQueryData(OWN_ITEMS_KEY, ITEMS);
      queryClient.setQueryData(
        buildItemMembershipsKey(itemId),
        ITEM_MEMBERSHIPS_RESPONSE,
      );
      queryClient.setQueryData(
        buildItemInvitationsKey(itemId),
        initialInvitations,
      );

      const endpoints = [
        {
          response: [MEMBERS_RESPONSE],
          method: REQUEST_METHODS.GET,
          route: `/${buildGetMembersBy(emails)}`,
        },
        {
          response: ITEM_MEMBERSHIPS_RESPONSE,
          method: REQUEST_METHODS.POST,
          route: `/${buildPostManyItemMembershipsRoute(itemId)}`,
        },
        {
          response: initialInvitations,
          method: REQUEST_METHODS.POST,
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
        await mockedMutation.mutate({ itemId, data: invitations });
        await waitForMutation();
      });

      // check invalidations
      const mem = queryClient.getQueryState(buildItemMembershipsKey(itemId));
      expect(mem?.isInvalidated).toBeTruthy();
      const inv = queryClient.getQueryState(buildItemInvitationsKey(itemId));
      expect(inv?.isInvalidated).toBeTruthy();

      // check notification trigger
      expect(mockedNotifier).toHaveBeenCalledWith({
        type: shareItemRoutine.SUCCESS,
        payload: expect.anything(),
      });
    });

    it('Mixed return values for sharing item with many emails', async () => {
      // set data in cache
      ITEMS.forEach((i) => {
        const itemKey = buildItemKey(i.id);
        queryClient.setQueryData(itemKey, i);
      });
      queryClient.setQueryData(OWN_ITEMS_KEY, ITEMS);
      queryClient.setQueryData(
        buildItemMembershipsKey(itemId),
        ITEM_MEMBERSHIPS_RESPONSE,
      );
      queryClient.setQueryData(
        buildItemInvitationsKey(itemId),
        initialInvitations,
      );

      const endpoints = [
        {
          response: [[{ email: emails[0], id: emails[0] }]],
          method: REQUEST_METHODS.GET,
          route: `/${buildGetMembersBy(emails)}`,
        },
        {
          response: [...ITEM_MEMBERSHIPS_RESPONSE, UNAUTHORIZED_RESPONSE],
          method: REQUEST_METHODS.POST,
          route: `/${buildPostManyItemMembershipsRoute(itemId)}`,
        },
        {
          response: [...initialInvitations, UNAUTHORIZED_RESPONSE],
          method: REQUEST_METHODS.POST,
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
        await mockedMutation.mutate({ itemId, data: invitations });
        await waitForMutation();
      });

      // check invalidations
      const mem = queryClient.getQueryState(buildItemMembershipsKey(itemId));
      expect(mem?.isInvalidated).toBeTruthy();
      const inv = queryClient.getQueryState(buildItemInvitationsKey(itemId));
      expect(inv?.isInvalidated).toBeTruthy();

      // check notification trigger
      const param = mockedNotifier.mock.calls[0][0];
      expect(param).toMatchObject({
        type: shareItemRoutine.SUCCESS,
        payload: {
          success: expect.anything(),
          failure: [UNAUTHORIZED_RESPONSE, UNAUTHORIZED_RESPONSE],
        },
      });
    });

    it('Unauthorized to search members', async () => {
      // set data in cache
      ITEMS.forEach((i) => {
        const itemKey = buildItemKey(i.id);
        queryClient.setQueryData(itemKey, i);
      });
      queryClient.setQueryData(OWN_ITEMS_KEY, ITEMS);
      queryClient.setQueryData(
        buildItemMembershipsKey(itemId),
        ITEM_MEMBERSHIPS_RESPONSE,
      );
      queryClient.setQueryData(
        buildItemInvitationsKey(itemId),
        initialInvitations,
      );

      const endpoints = [
        {
          response: UNAUTHORIZED_RESPONSE,
          statusCode: StatusCodes.UNAUTHORIZED,
          method: REQUEST_METHODS.GET,
          route: `/${buildGetMembersBy(emails)}`,
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      const invitations = emails.map((email) => ({ email, permission }));
      await act(async () => {
        await mockedMutation.mutate({ itemId, data: invitations });
        await waitForMutation();
      });

      // check invalidations
      const mem = queryClient.getQueryState(buildItemMembershipsKey(itemId));
      expect(mem?.isInvalidated).toBeTruthy();
      const inv = queryClient.getQueryState(buildItemInvitationsKey(itemId));
      expect(inv?.isInvalidated).toBeTruthy();

      // check notification trigger
      expect(mockedNotifier).toHaveBeenCalledWith({
        type: shareItemRoutine.FAILURE,
        payload: expect.anything(),
      });
    });

    it('Unauthorized to post memberships', async () => {
      // set data in cache
      ITEMS.forEach((i) => {
        const itemKey = buildItemKey(i.id);
        queryClient.setQueryData(itemKey, i);
      });
      queryClient.setQueryData(OWN_ITEMS_KEY, ITEMS);
      queryClient.setQueryData(
        buildItemMembershipsKey(itemId),
        ITEM_MEMBERSHIPS_RESPONSE,
      );
      queryClient.setQueryData(
        buildItemInvitationsKey(itemId),
        initialInvitations,
      );

      const endpoints = [
        {
          response: [[{ email: emails[0], id: emails[0] }]],
          method: REQUEST_METHODS.GET,
          route: `/${buildGetMembersBy(emails)}`,
        },
        {
          response: UNAUTHORIZED_RESPONSE,
          statusCode: StatusCodes.UNAUTHORIZED,
          method: REQUEST_METHODS.POST,
          route: `/${buildPostManyItemMembershipsRoute(itemId)}`,
        },
        {
          response: initialInvitations,
          method: REQUEST_METHODS.POST,
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
        await mockedMutation.mutate({ itemId, data: invitations });
        await waitForMutation();
      });

      // check invalidations
      const mem = queryClient.getQueryState(buildItemMembershipsKey(itemId));
      expect(mem?.isInvalidated).toBeTruthy();
      const inv = queryClient.getQueryState(buildItemInvitationsKey(itemId));
      expect(inv?.isInvalidated).toBeTruthy();

      // check notification trigger
      const param = mockedNotifier.mock.calls[0][0];
      expect(param).toMatchObject({
        type: shareItemRoutine.SUCCESS,
        payload: expect.anything(),
      });
      expect(param.payload.failure).toHaveLength(1);
    });

    it('Unauthorized to post invitations', async () => {
      // set data in cache
      ITEMS.forEach((i) => {
        const itemKey = buildItemKey(i.id);
        queryClient.setQueryData(itemKey, i);
      });
      queryClient.setQueryData(OWN_ITEMS_KEY, ITEMS);
      queryClient.setQueryData(
        buildItemMembershipsKey(itemId),
        ITEM_MEMBERSHIPS_RESPONSE,
      );
      queryClient.setQueryData(
        buildItemInvitationsKey(itemId),
        initialInvitations,
      );

      const endpoints = [
        {
          response: [[{ email: emails[0], id: emails[0] }]],
          method: REQUEST_METHODS.GET,
          route: `/${buildGetMembersBy(emails)}`,
        },
        {
          response: ITEM_MEMBERSHIPS_RESPONSE,
          method: REQUEST_METHODS.POST,
          route: `/${buildPostManyItemMembershipsRoute(itemId)}`,
        },
        {
          response: UNAUTHORIZED_RESPONSE,
          statusCode: StatusCodes.UNAUTHORIZED,
          method: REQUEST_METHODS.POST,
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
        await mockedMutation.mutate({ itemId, data: invitations });
        await waitForMutation();
      });

      // check invalidations
      const mem = queryClient.getQueryState(buildItemMembershipsKey(itemId));
      expect(mem?.isInvalidated).toBeTruthy();
      const inv = queryClient.getQueryState(buildItemInvitationsKey(itemId));
      expect(inv?.isInvalidated).toBeTruthy();

      // check notification trigger
      const param = mockedNotifier.mock.calls[0][0];
      expect(param).toMatchObject({
        type: shareItemRoutine.SUCCESS,
        payload: expect.anything(),
      });
      expect(param.payload.failure).toHaveLength(1);
    });
  });
});

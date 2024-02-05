import {
  FolderItemFactory,
  HttpMethod,
  ItemMembership,
  MemberFactory,
  PermissionLevel,
} from '@graasp/sdk';
import { SUCCESS_MESSAGES } from '@graasp/translations';

import { StatusCodes } from 'http-status-codes';
import nock from 'nock';
import { act } from 'react-test-renderer';

import {
  ITEM_MEMBERSHIPS_RESPONSE,
  OK_RESPONSE,
  UNAUTHORIZED_RESPONSE,
  buildMockInvitations,
  buildResultOfData,
} from '../../test/constants';
import {
  Endpoint,
  mockMutation,
  setUpTest,
  waitForMutation,
} from '../../test/utils';
import {
  buildDeleteItemMembershipRoute,
  buildEditItemMembershipRoute,
  buildGetMembersBy,
  buildPostInvitationsRoute,
  buildPostItemMembershipRoute,
  buildPostManyItemMembershipsRoute,
} from '../api/routes';
import {
  OWN_ITEMS_KEY,
  buildItemInvitationsKey,
  buildItemKey,
  buildItemMembershipsKey,
} from '../config/keys';
import {
  deleteItemMembershipRoutine,
  editItemMembershipRoutine,
  shareItemRoutine,
} from '../routines';

const mockedNotifier = jest.fn();
const { wrapper, queryClient, mutations } = setUpTest({
  notifier: mockedNotifier,
});

describe('Membership Mutations', () => {
  afterEach(() => {
    queryClient.clear();
    nock.cleanAll();
    jest.clearAllMocks();
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
  const membershipsKey = buildItemMembershipsKey(itemId);
  const membershipId = memberships[0].id;
  const permission = PermissionLevel.Read;

  describe('usePostItemMembership', () => {
    const mutation = mutations.usePostItemMembership;

    const { email } = MemberFactory();

    it('Create one membership', async () => {
      const route = `/${buildPostItemMembershipRoute(itemId)}`;

      // set data in cache
      items.forEach((i) => {
        const itemKey = buildItemKey(i.id);
        queryClient.setQueryData(itemKey, i);
      });
      // todo: change to Accessible ?
      queryClient.setQueryData(OWN_ITEMS_KEY, items);
      queryClient.setQueryData(
        buildItemMembershipsKey(itemId),
        ITEM_MEMBERSHIPS_RESPONSE,
      );

      const response = OK_RESPONSE;

      const endpoints = [
        {
          response: [MemberFactory()],
          method: HttpMethod.GET,
          route: `/${buildGetMembersBy([email])}`,
        },
        {
          response,
          method: HttpMethod.POST,
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
      items.forEach((i) => {
        const itemKey = buildItemKey(i.id);
        queryClient.setQueryData(itemKey, i);
      });
      // todo: change to Accessible ?
      queryClient.setQueryData(OWN_ITEMS_KEY, items);
      queryClient.setQueryData(
        buildItemMembershipsKey(itemId),
        ITEM_MEMBERSHIPS_RESPONSE,
      );

      const endpoints = [
        {
          response: [MemberFactory()],
          method: HttpMethod.GET,
          route: `/${buildGetMembersBy([email])}`,
        },
        {
          response: UNAUTHORIZED_RESPONSE,
          statusCode: StatusCodes.UNAUTHORIZED,
          method: HttpMethod.POST,
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

  describe('useEditItemMembership', () => {
    const route = `/${buildEditItemMembershipRoute(membershipId)}`;
    const mutation = mutations.useEditItemMembership;

    it('Edit item membership', async () => {
      queryClient.setQueryData(membershipsKey, memberships);

      const endpoints = [
        {
          response: {},
          method: HttpMethod.PATCH,
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
          method: HttpMethod.PATCH,
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

  describe('useDeleteItemMembership', () => {
    const route = `/${buildDeleteItemMembershipRoute(membershipId)}`;
    const mutation = mutations.useDeleteItemMembership;

    it('Delete item membership', async () => {
      queryClient.setQueryData(membershipsKey, ITEM_MEMBERSHIPS_RESPONSE);

      const endpoints = [
        {
          response: {},
          method: HttpMethod.DELETE,
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
          method: HttpMethod.DELETE,
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
        const itemKey = buildItemKey(i.id);
        queryClient.setQueryData(itemKey, i);
      });
      // todo: change to Accessible ?
      queryClient.setQueryData(OWN_ITEMS_KEY, items);
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
          response: buildResultOfData([MemberFactory()]),
          method: HttpMethod.GET,
          route: `/${buildGetMembersBy(emails)}`,
        },
        {
          response: ITEM_MEMBERSHIPS_RESPONSE,
          method: HttpMethod.POST,
          route: `/${buildPostManyItemMembershipsRoute(itemId)}`,
        },
        {
          response: initialInvitations,
          method: HttpMethod.POST,
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
      items.forEach((i) => {
        const itemKey = buildItemKey(i.id);
        queryClient.setQueryData(itemKey, i);
      });
      // todo: change to Accessible ?
      queryClient.setQueryData(OWN_ITEMS_KEY, items);
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
          response: buildResultOfData([{ email: emails[0], id: emails[0] }]),
          method: HttpMethod.GET,
          route: `/${buildGetMembersBy(emails)}`,
        },
        {
          response: buildResultOfData(
            [ITEM_MEMBERSHIPS_RESPONSE[0]],
            (d) => d.item.id,
            [UNAUTHORIZED_RESPONSE],
          ),
          method: HttpMethod.POST,
          route: `/${buildPostManyItemMembershipsRoute(itemId)}`,
        },
        {
          response: buildResultOfData([initialInvitations[0]], (d) => d.email, [
            UNAUTHORIZED_RESPONSE,
          ]),
          method: HttpMethod.POST,
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
      expect(param.type).toEqual(shareItemRoutine.SUCCESS);
      expect(param.payload).toMatchObject(
        buildResultOfData(
          [ITEM_MEMBERSHIPS_RESPONSE[0], initialInvitations[0]],
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (d) => (d as any)?.member?.email || (d as any)?.email,
          [UNAUTHORIZED_RESPONSE, UNAUTHORIZED_RESPONSE],
        ),
      );
    });

    it('Unauthorized to search members', async () => {
      // set data in cache
      items.forEach((i) => {
        const itemKey = buildItemKey(i.id);
        queryClient.setQueryData(itemKey, i);
      });
      // todo: change to Accessible ?
      queryClient.setQueryData(OWN_ITEMS_KEY, items);
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
          method: HttpMethod.GET,
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
      items.forEach((i) => {
        const itemKey = buildItemKey(i.id);
        queryClient.setQueryData(itemKey, i);
      });
      // todo: change to Accessible ?
      queryClient.setQueryData(OWN_ITEMS_KEY, items);
      queryClient.setQueryData(
        buildItemMembershipsKey(itemId),
        ITEM_MEMBERSHIPS_RESPONSE,
      );
      queryClient.setQueryData(
        buildItemInvitationsKey(itemId),
        initialInvitations,
      );

      const endpoints: Endpoint[] = [
        {
          response: buildResultOfData([{ email: emails[0], id: emails[0] }]),
          method: HttpMethod.GET,
          route: `/${buildGetMembersBy(emails)}`,
        },
        {
          response: UNAUTHORIZED_RESPONSE,
          statusCode: StatusCodes.UNAUTHORIZED,
          method: HttpMethod.POST,
          route: `/${buildPostManyItemMembershipsRoute(itemId)}`,
        },
        {
          response: buildResultOfData(initialInvitations),
          method: HttpMethod.POST,
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
      expect(param.type).toEqual(shareItemRoutine.SUCCESS);
      expect(param.payload.errors).toHaveLength(1);
    });

    it('Unauthorized to post invitations', async () => {
      // set data in cache
      items.forEach((i) => {
        const itemKey = buildItemKey(i.id);
        queryClient.setQueryData(itemKey, i);
      });
      // todo: change to Accessible ?
      queryClient.setQueryData(OWN_ITEMS_KEY, items);
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
          response: buildResultOfData([{ email: emails[0], id: emails[0] }]),
          method: HttpMethod.GET,
          route: `/${buildGetMembersBy(emails)}`,
        },
        {
          response: buildResultOfData(ITEM_MEMBERSHIPS_RESPONSE),
          method: HttpMethod.POST,
          route: `/${buildPostManyItemMembershipsRoute(itemId)}`,
        },
        {
          response: UNAUTHORIZED_RESPONSE,
          statusCode: StatusCodes.UNAUTHORIZED,
          method: HttpMethod.POST,
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
      expect(param.payload.errors).toHaveLength(1);
    });
  });
});

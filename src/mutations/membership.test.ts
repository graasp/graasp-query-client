/* eslint-disable import/no-extraneous-dependencies */
import nock from 'nock';
import { List, Map } from 'immutable';
import { act } from 'react-test-renderer';
import { StatusCodes } from 'http-status-codes';
import Cookies from 'js-cookie';
import { SUCCESS_MESSAGES } from '@graasp/translations';
import {
  ITEMS,
  ITEM_MEMBERSHIPS_RESPONSE,
  MEMBER_RESPONSE,
  OK_RESPONSE,
  UNAUTHORIZED_RESPONSE,
} from '../../test/constants';
import { mockMutation, setUpTest, waitForMutation } from '../../test/utils';
import {
  buildDeleteItemMembershipRoute,
  buildEditItemMembershipRoute,
  buildGetMembersBy,
  buildPostItemMembershipRoute,
} from '../api/routes';
import { REQUEST_METHODS } from '../api/utils';
import {
  buildItemKey,
  buildItemMembershipsKey,
  MUTATION_KEYS,
  OWN_ITEMS_KEY,
} from '../config/keys';
import {
  deleteItemMembershipRoutine,
  editItemMembershipRoutine,
} from '../routines';
import { Membership, PERMISSION_LEVELS } from '../types';

const mockedNotifier = jest.fn();
const { wrapper, queryClient, useMutation } = setUpTest({
  notifier: mockedNotifier,
});

jest.spyOn(Cookies, 'get').mockReturnValue({ session: 'somesession' });

describe('Membership Mutations', () => {
  afterEach(() => {
    queryClient.clear();
    nock.cleanAll();
  });

  const item = ITEMS[0];
  const itemId = item.id;
  const memberships = ITEM_MEMBERSHIPS_RESPONSE;
  const membershipsKey = buildItemMembershipsKey(itemId);
  const membershipId = memberships[0].id;
  const permission = PERMISSION_LEVELS.READ;

  describe(MUTATION_KEYS.POST_ITEM_MEMBERSHIP, () => {
    const mutation = () => useMutation(MUTATION_KEYS.POST_ITEM_MEMBERSHIP);
    const { email } = MEMBER_RESPONSE;

    it('Share one item', async () => {
      const route = `/${buildPostItemMembershipRoute(itemId)}`;

      // set data in cache
      ITEMS.forEach((i) => {
        const itemKey = buildItemKey(i.id);
        queryClient.setQueryData(itemKey, Map(i));
      });
      queryClient.setQueryData(OWN_ITEMS_KEY, List(ITEMS));
      queryClient.setQueryData(
        buildItemMembershipsKey(itemId),
        ITEM_MEMBERSHIPS_RESPONSE,
      );

      const response = OK_RESPONSE;

      const endpoints = [
        {
          response: [MEMBER_RESPONSE],
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

    it('Unauthorized to share an item', async () => {
      const route = `/${buildPostItemMembershipRoute(itemId)}`;

      // set data in cache
      ITEMS.forEach((i) => {
        const itemKey = buildItemKey(i.id);
        queryClient.setQueryData(itemKey, Map(i));
      });
      queryClient.setQueryData(OWN_ITEMS_KEY, List(ITEMS));
      queryClient.setQueryData(
        buildItemMembershipsKey(itemId),
        ITEM_MEMBERSHIPS_RESPONSE,
      );

      const endpoints = [
        {
          response: [MEMBER_RESPONSE],
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
      queryClient.setQueryData(membershipsKey, List(memberships));

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
      queryClient.setQueryData(membershipsKey, List(ITEM_MEMBERSHIPS_RESPONSE));

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
      queryClient.setQueryData(membershipsKey, List(ITEM_MEMBERSHIPS_RESPONSE));

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
        queryClient.getQueryData<List<Membership>>(membershipsKey)?.toJS(),
      ).toEqual(memberships.filter(({ id }) => id !== membershipId));
      expect(mockedNotifier).toHaveBeenCalledWith({
        type: deleteItemMembershipRoutine.SUCCESS,
        payload: { message: SUCCESS_MESSAGES.DELETE_ITEM_MEMBERSHIP },
      });
    });

    it('Unauthorized to delete item membership', async () => {
      queryClient.setQueryData(membershipsKey, List(ITEM_MEMBERSHIPS_RESPONSE));

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
        queryClient.getQueryData<List<Membership>>(membershipsKey)?.toJS(),
      ).toEqual(memberships);
      expect(mockedNotifier).toHaveBeenCalledWith(
        expect.objectContaining({
          type: deleteItemMembershipRoutine.FAILURE,
        }),
      );
    });
  });
});

/* eslint-disable import/no-extraneous-dependencies */
import nock from 'nock';
import { List } from 'immutable';
import { act } from 'react-test-renderer';
import { StatusCodes } from 'http-status-codes';
import {
  ITEMS,
  ITEM_MEMBERSHIPS_RESPONSE,
  UNAUTHORIZED_RESPONSE,
} from '../../test/constants';
import { mockMutation, setUpTest, waitForMutation } from '../../test/utils';
import {
  buildDeleteItemMembershipRoute,
  buildEditItemMembershipRoute,
} from '../api/routes';
import { REQUEST_METHODS } from '../api/utils';
import { buildItemMembershipsKey, MUTATION_KEYS } from '../config/keys';
import {
  deleteItemMembershipRoutine,
  editItemMembershipRoutine,
} from '../routines';
import { Membership, PERMISSION_LEVELS } from '../types';

const mockedNotifier = jest.fn();
const { wrapper, queryClient, useMutation } = setUpTest({
  notifier: mockedNotifier,
});
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

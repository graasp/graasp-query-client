/* eslint-disable import/no-extraneous-dependencies */
import { StatusCodes } from 'http-status-codes';
import { List } from 'immutable';
import Cookies from 'js-cookie';
import nock from 'nock';

import { MAX_TARGETS_FOR_READ_REQUEST } from '@graasp/sdk';

import {
  ITEMS,
  ITEM_MEMBERSHIPS_RESPONSE,
  UNAUTHORIZED_RESPONSE,
} from '../../test/constants';
import { mockHook, setUpTest, splitEndpointByIds } from '../../test/utils';
import {
  buildGetItemMembershipsForItemsRoute,
  buildGetPublicItemMembershipsForItemsRoute,
} from '../api/routes';
import {
  buildItemMembershipsKey,
  buildManyItemMembershipsKey,
} from '../config/keys';
import type { ItemMembershipRecord } from '../types';

const { hooks, wrapper, queryClient } = setUpTest();
jest.spyOn(Cookies, 'get').mockReturnValue({ session: 'somesession' });

describe('Membership Hooks', () => {
  afterEach(() => {
    nock.cleanAll();
    queryClient.clear();
  });

  describe('useItemMemberships', () => {
    const { id } = ITEMS.first()!;
    const response = [ITEM_MEMBERSHIPS_RESPONSE];
    const route = `/${buildGetItemMembershipsForItemsRoute([id])}`;
    const key = buildItemMembershipsKey(id);

    it(`Receive one item's memberships`, async () => {
      const hook = () => hooks.useItemMemberships(id);
      const endpoints = [{ route, response }];
      const { data } = await mockHook({ endpoints, hook, wrapper });

      expect(data as List<ItemMembershipRecord>).toEqualImmutable(response[0]);
      // verify cache keys
      expect(queryClient.getQueryData(key)).toEqualImmutable(response[0]);
    });

    it(`Undefined ids does not fetch`, async () => {
      const hook = () => hooks.useItemMemberships(undefined);
      const endpoints = [{ route, response }];
      const { data, isFetched } = await mockHook({
        endpoints,
        hook,
        wrapper,
        enabled: false,
      });

      expect(isFetched).toBeFalsy();
      expect(data).toBeFalsy();
      // verify cache keys
      expect(queryClient.getQueryData(key)).toBeFalsy();
    });

    // this tests fallbackForArray
    it(`Merge private and public data if result with correct data and errors`, async () => {
      const hook = () => hooks.useItemMemberships(id);
      const publicRoute = `/${buildGetPublicItemMembershipsForItemsRoute([
        id,
      ])}`;
      const publicResponse = [
        { statusCode: StatusCodes.FORBIDDEN },
        ITEM_MEMBERSHIPS_RESPONSE,
      ];
      const privateResponse = [
        ITEM_MEMBERSHIPS_RESPONSE,
        { statusCode: StatusCodes.FORBIDDEN },
      ];
      const endpoints = [
        { route, response: privateResponse },
        { route: publicRoute, response: publicResponse },
      ];
      const { data } = await mockHook({
        endpoints,
        hook,
        wrapper,
      });

      expect(data as List<ItemMembershipRecord>).toEqualImmutable(response[0]);
      // verify cache keys
      expect(queryClient.getQueryData(key)).toEqualImmutable(response[0]);
    });

    it(`Unauthorized`, async () => {
      const hook = () => hooks.useItemMemberships(id);
      const endpoints = [
        {
          route,
          response: UNAUTHORIZED_RESPONSE,
          statusCode: StatusCodes.UNAUTHORIZED,
        },
      ];
      const { data, isError } = await mockHook({
        hook,
        endpoints,
        wrapper,
      });

      expect(isError).toBeTruthy();
      expect(data).toBeFalsy();
      // verify cache keys
      expect(queryClient.getQueryData(key)).toBeFalsy();
    });
  });

  describe('useManyItemMemberships', () => {
    const ids = [ITEMS.first()!.id, ITEMS.get(1)!.id];
    const response = List([
      ITEM_MEMBERSHIPS_RESPONSE,
      ITEM_MEMBERSHIPS_RESPONSE,
    ]);
    const route = `/${buildGetItemMembershipsForItemsRoute(ids)}`;
    const key = buildManyItemMembershipsKey(ids);

    it(`Receive one item memberships`, async () => {
      const id = [ITEMS.first()!.id];
      const oneRoute = `/${buildGetItemMembershipsForItemsRoute(id)}`;
      const oneResponse = List([ITEM_MEMBERSHIPS_RESPONSE]);
      const oneKey = buildManyItemMembershipsKey(id);
      const hook = () => hooks.useManyItemMemberships(id);
      const endpoints = [{ route: oneRoute, response: oneResponse }];
      const { data } = await mockHook({ endpoints, hook, wrapper });

      expect(data as List<List<ItemMembershipRecord>>).toEqualImmutable(
        oneResponse,
      );
      // verify cache keys
      expect(queryClient.getQueryData(oneKey)).toEqualImmutable(oneResponse);
    });

    it(`Receive two item memberships`, async () => {
      const endpoints = [{ route, response }];
      const hook = () => hooks.useManyItemMemberships(ids);
      const { data } = await mockHook({ endpoints, hook, wrapper });

      expect(data as List<List<ItemMembershipRecord>>).toEqualImmutable(
        response,
      );
      // verify cache keys
      expect(queryClient.getQueryData(key)).toEqualImmutable(response);
    });

    it(`Receive lots of item memberships`, async () => {
      const manyIds = ITEMS.map(({ id }) => id).toArray();
      const manyResponse = List(manyIds.map(() => ITEM_MEMBERSHIPS_RESPONSE));
      const manyKey = buildManyItemMembershipsKey(manyIds);
      const hook = () => hooks.useManyItemMemberships(manyIds);
      const endpoints = splitEndpointByIds(
        manyIds,
        MAX_TARGETS_FOR_READ_REQUEST,
        (chunk) => `/${buildGetItemMembershipsForItemsRoute(chunk)}`,
        manyResponse.toJS(),
      );
      const { data } = await mockHook({ endpoints, hook, wrapper });

      expect(data as List<List<ItemMembershipRecord>>).toEqualImmutable(
        manyResponse,
      );
      // verify cache keys
      expect(queryClient.getQueryData(manyKey)).toEqualImmutable(manyResponse);
    });

    it(`Undefined ids does not fetch`, async () => {
      const hook = () => hooks.useManyItemMemberships(undefined);
      const { data, isFetched } = await mockHook({
        endpoints: [],
        hook,
        wrapper,
        enabled: false,
      });

      expect(isFetched).toBeFalsy();
      expect(data).toBeFalsy();
      // verify cache keys
      expect(queryClient.getQueryData(key)).toBeFalsy();
    });

    // this tests fallbackForArray
    it(`Merge private and public data if result with correct data and errors`, async () => {
      const hook = () => hooks.useManyItemMemberships(ids);
      const publicRoute = `/${buildGetPublicItemMembershipsForItemsRoute(ids)}`;
      const publicResponse = [
        { statusCode: StatusCodes.FORBIDDEN },
        ITEM_MEMBERSHIPS_RESPONSE,
      ];
      const privateResponse = [
        ITEM_MEMBERSHIPS_RESPONSE,
        { statusCode: StatusCodes.FORBIDDEN },
      ];
      const endpoints = [
        { route, response: privateResponse },
        { route: publicRoute, response: publicResponse },
      ];
      const { data } = await mockHook({
        endpoints,
        hook,
        wrapper,
      });

      expect(data as List<List<ItemMembershipRecord>>).toEqualImmutable(
        response,
      );
      // verify cache keys
      expect(queryClient.getQueryData(key)).toEqualImmutable(response);
    });

    it(`Unauthorized`, async () => {
      const hook = () => hooks.useManyItemMemberships(ids);
      const endpoints = [
        {
          route,
          response: UNAUTHORIZED_RESPONSE,
          statusCode: StatusCodes.UNAUTHORIZED,
        },
      ];
      const { data, isError } = await mockHook({
        hook,
        endpoints,
        wrapper,
      });

      expect(isError).toBeTruthy();
      expect(data).toBeFalsy();
      // verify cache keys
      expect(queryClient.getQueryData(key)).toBeFalsy();
    });
  });
});

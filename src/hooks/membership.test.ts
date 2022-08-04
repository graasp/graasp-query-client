/* eslint-disable import/no-extraneous-dependencies */
import nock from 'nock';
import Cookies from 'js-cookie';
import { StatusCodes } from 'http-status-codes';
import { List } from 'immutable';
import {
  buildGetItemMembershipsForItemsRoute,
  buildGetPublicItemMembershipsForItemsRoute,
} from '../api/routes';
import { mockHook, setUpTest } from '../../test/utils';
import {
  ITEMS,
  ITEM_MEMBERSHIPS_RESPONSE,
  UNAUTHORIZED_RESPONSE,
} from '../../test/constants';
import {
  buildManyItemMembershipsKey,
  buildItemMembershipsKey,
} from '../config/keys';
import type { MembershipRecord } from '../types';

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

      expect((data as List<MembershipRecord>)).toEqualImmutable(response[0]);
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

      expect((data as List<MembershipRecord>)).toEqualImmutable(response[0]);
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
    const response = List([ITEM_MEMBERSHIPS_RESPONSE, ITEM_MEMBERSHIPS_RESPONSE]);
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

      expect((data as List<List<MembershipRecord>>)).toEqualImmutable(oneResponse);
      // verify cache keys
      expect(queryClient.getQueryData(oneKey)).toEqualImmutable(oneResponse);
    });

    it(`Receive multiple item memberships`, async () => {
      const hook = () => hooks.useManyItemMemberships(ids);
      const endpoints = [{ route, response }];
      const { data } = await mockHook({ endpoints, hook, wrapper });

      expect((data as List<List<MembershipRecord>>)).toEqualImmutable(response);
      // verify cache keys
      expect(queryClient.getQueryData(key)).toEqualImmutable(response);
    });

    it(`Undefined ids does not fetch`, async () => {
      const hook = () => hooks.useManyItemMemberships(undefined);
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

      expect((data as List<List<MembershipRecord>>)).toEqualImmutable(response);
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

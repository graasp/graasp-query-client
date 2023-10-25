/* eslint-disable import/no-extraneous-dependencies */
import {
  ItemMembership,
  MAX_TARGETS_FOR_READ_REQUEST,
  ResultOf,
} from '@graasp/sdk';

import { StatusCodes } from 'http-status-codes';
import Cookies from 'js-cookie';
import nock from 'nock';

import {
  ITEMS,
  ITEM_MEMBERSHIPS_RESPONSE,
  UNAUTHORIZED_RESPONSE,
  buildResultOfData,
} from '../../test/constants';
import { mockHook, setUpTest, splitEndpointByIds } from '../../test/utils';
import { buildGetItemMembershipsForItemsRoute } from '../api/routes';
import {
  buildItemMembershipsKey,
  buildManyItemMembershipsKey,
} from '../config/keys';

const { hooks, wrapper, queryClient } = setUpTest();
jest.spyOn(Cookies, 'get').mockReturnValue({ session: 'somesession' });

describe('Membership Hooks', () => {
  afterEach(() => {
    nock.cleanAll();
    queryClient.clear();
  });

  describe('useItemMemberships', () => {
    const { id } = ITEMS[0];
    // this hook uses the many endpoint
    const response = buildResultOfData([ITEM_MEMBERSHIPS_RESPONSE]);
    const route = `/${buildGetItemMembershipsForItemsRoute([id])}`;
    const key = buildItemMembershipsKey(id);

    it(`Receive one item's memberships`, async () => {
      const hook = () => hooks.useItemMemberships(id);
      const endpoints = [{ route, response }];
      const { data } = await mockHook({ endpoints, hook, wrapper });

      expect(data).toEqual(response.data[id]);
      // verify cache keys
      expect(queryClient.getQueryData<ItemMembership>(key)).toEqual(
        response.data[id],
      );
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
    const ids = [ITEMS[0].id, ITEMS[1].id];
    const response = buildResultOfData([
      ITEM_MEMBERSHIPS_RESPONSE,
      ITEM_MEMBERSHIPS_RESPONSE,
    ]);
    const route = `/${buildGetItemMembershipsForItemsRoute(ids)}`;
    const key = buildManyItemMembershipsKey(ids);

    it(`Receive one item memberships`, async () => {
      const id = [ITEMS[0].id];
      const oneRoute = `/${buildGetItemMembershipsForItemsRoute(id)}`;
      const oneResponse = buildResultOfData([ITEM_MEMBERSHIPS_RESPONSE]);
      const oneKey = buildManyItemMembershipsKey(id);
      const hook = () => hooks.useManyItemMemberships(id);
      const endpoints = [{ route: oneRoute, response: oneResponse }];
      const { data } = await mockHook({ endpoints, hook, wrapper });

      expect(data).toEqual(oneResponse);
      // verify cache keys
      expect(queryClient.getQueryData<ItemMembership>(oneKey)).toEqual(
        oneResponse,
      );
    });

    it(`Receive two item memberships`, async () => {
      const endpoints = [{ route, response }];
      const hook = () => hooks.useManyItemMemberships(ids);
      const { data } = await mockHook({ endpoints, hook, wrapper });

      expect(Immutable.is(data, response)).toBeTruthy();
      // verify cache keys
      expect(queryClient.getQueryData<ResultOf<ItemMembership>>(key)).toEqual(
        response,
      );
    });

    it(`Receive lots of item memberships`, async () => {
      const manyIds = ITEMS.map(({ id }) => id);
      const memberships = manyIds.map(() => ITEM_MEMBERSHIPS_RESPONSE);
      const manyResponse = buildResultOfData(memberships);
      const manyKey = buildManyItemMembershipsKey(manyIds);
      const hook = () => hooks.useManyItemMemberships(manyIds);
      const endpoints = splitEndpointByIds(
        manyIds,
        MAX_TARGETS_FOR_READ_REQUEST,
        (chunk) => `/${buildGetItemMembershipsForItemsRoute(chunk)}`,
        memberships,
      );
      const { data } = await mockHook({ endpoints, hook, wrapper });

      expect(data).toEqual(manyResponse);
      // verify cache keys
      expect(queryClient.getQueryData(manyKey)).toEqual(manyResponse);
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

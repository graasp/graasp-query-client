/* eslint-disable import/no-extraneous-dependencies */
import {
  ItemMembership,
  MAX_TARGETS_FOR_READ_REQUEST,
  ResultOf,
  convertJs,
} from '@graasp/sdk';
import { ImmutableCast, ItemMembershipRecord } from '@graasp/sdk/frontend';

import { StatusCodes } from 'http-status-codes';
import Immutable from 'immutable';
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
    const { id } = ITEMS.first()!;
    // this hook uses the many endpoint
    const response = buildResultOfData([ITEM_MEMBERSHIPS_RESPONSE.toJS()]);
    const route = `/${buildGetItemMembershipsForItemsRoute([id])}`;
    const key = buildItemMembershipsKey(id);

    it(`Receive one item's memberships`, async () => {
      const hook = () => hooks.useItemMemberships(id);
      const endpoints = [{ route, response }];
      const { data } = await mockHook({ endpoints, hook, wrapper });

      expect(data?.toJS()).toEqual(response.data[id]);
      // verify cache keys
      expect(
        queryClient.getQueryData<ItemMembershipRecord>(key)?.toJS(),
      ).toEqual(response.data[id]);
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
    const ids = [ITEMS.first()!.id, ITEMS.get(1)!.id];
    const response = buildResultOfData([
      ITEM_MEMBERSHIPS_RESPONSE.toJS(),
      ITEM_MEMBERSHIPS_RESPONSE.toJS(),
    ]);
    const route = `/${buildGetItemMembershipsForItemsRoute(ids)}`;
    const key = buildManyItemMembershipsKey(ids);

    it(`Receive one item memberships`, async () => {
      const id = [ITEMS.first()!.id];
      const oneRoute = `/${buildGetItemMembershipsForItemsRoute(id)}`;
      const oneResponse = buildResultOfData([ITEM_MEMBERSHIPS_RESPONSE.toJS()]);
      const oneKey = buildManyItemMembershipsKey(id);
      const hook = () => hooks.useManyItemMemberships(id);
      const endpoints = [{ route: oneRoute, response: oneResponse }];
      const { data } = await mockHook({ endpoints, hook, wrapper });

      expect(data?.toJS()).toEqual(oneResponse);
      // verify cache keys
      expect(
        queryClient.getQueryData<ItemMembershipRecord>(oneKey)?.toJS(),
      ).toEqual(oneResponse);
    });

    it(`Receive two item memberships`, async () => {
      const endpoints = [{ route, response }];
      const hook = () => hooks.useManyItemMemberships(ids);
      const { data } = await mockHook({ endpoints, hook, wrapper });

      expect(Immutable.is(data, convertJs(response))).toBeTruthy();
      // verify cache keys
      expect(
        queryClient
          .getQueryData<ImmutableCast<ResultOf<ItemMembership>>>(key)
          ?.toJS(),
      ).toEqual(response);
    });

    it(`Receive lots of item memberships`, async () => {
      const manyIds = ITEMS.map(({ id }) => id).toArray();
      const memberships = manyIds.map(() => ITEM_MEMBERSHIPS_RESPONSE.toJS());
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

      expect(Immutable.is(data, convertJs(manyResponse))).toBeTruthy();
      // verify cache keys
      expect(
        Immutable.is(
          queryClient.getQueryData(manyKey),
          convertJs(manyResponse),
        ),
      ).toBeTruthy();
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

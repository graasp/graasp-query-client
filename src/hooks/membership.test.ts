import {
  FolderItemFactory,
  ItemMembership,
  MAX_TARGETS_FOR_READ_REQUEST,
  ResultOf,
} from '@graasp/sdk';

import { StatusCodes } from 'http-status-codes';
import nock from 'nock';
import { afterEach, describe, expect, it } from 'vitest';

import {
  ITEM_MEMBERSHIPS_RESPONSE,
  UNAUTHORIZED_RESPONSE,
  buildResultOfData,
  generateFolders,
} from '../../test/constants.js';
import { mockHook, setUpTest, splitEndpointByIds } from '../../test/utils.js';
import { buildManyItemMembershipsKey, itemKeys } from '../keys.js';
import { buildGetItemMembershipsForItemsRoute } from '../routes.js';

const { hooks, wrapper, queryClient } = setUpTest();

describe('Membership Hooks', () => {
  afterEach(() => {
    nock.cleanAll();
    queryClient.clear();
  });

  describe('useItemMemberships', () => {
    const { id } = FolderItemFactory();
    // this hook uses the many endpoint
    const response = buildResultOfData([ITEM_MEMBERSHIPS_RESPONSE]);
    const route = `/${buildGetItemMembershipsForItemsRoute([id])}`;
    const key = itemKeys.single(id).memberships;

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
    const ids = [
      FolderItemFactory().id,
      FolderItemFactory().id,
      FolderItemFactory().id,
    ];
    const response = buildResultOfData([
      ITEM_MEMBERSHIPS_RESPONSE,
      ITEM_MEMBERSHIPS_RESPONSE,
    ]);
    const route = `/${buildGetItemMembershipsForItemsRoute(ids)}`;
    const key = buildManyItemMembershipsKey(ids);

    it(`Receive one item memberships`, async () => {
      const id = [ids[0]];
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

      expect(data).toMatchObject(response);
      // verify cache keys
      expect(queryClient.getQueryData<ResultOf<ItemMembership>>(key)).toEqual(
        response,
      );
    });

    it(`Receive lots of item memberships`, async () => {
      const manyIds = generateFolders(MAX_TARGETS_FOR_READ_REQUEST + 1).map(
        ({ id }) => id,
      );
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

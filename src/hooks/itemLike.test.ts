import { ItemLike } from '@graasp/sdk';

import { StatusCodes } from 'http-status-codes';
import nock from 'nock';

import { ITEMS, ITEM_LIKES, UNAUTHORIZED_RESPONSE } from '../../test/constants';
import { mockHook, setUpTest } from '../../test/utils';
import {
  buildGetItemLikesRoute,
  buildGetLikesForMemberRoute,
} from '../api/routes';
import {
  buildGetLikesForItem,
  buildGetLikesForMemberKey,
} from '../config/keys';

const { hooks, wrapper, queryClient } = setUpTest();

describe('Item Like Hooks', () => {
  afterEach(() => {
    nock.cleanAll();
    queryClient.clear();
  });

  describe('useLikesForMember', () => {
    const memberId = 'member-id';
    const route = `/${buildGetLikesForMemberRoute(memberId)}`;
    const key = buildGetLikesForMemberKey(memberId);

    const hook = () => hooks.useLikesForMember(memberId);

    it(`Receive item likes`, async () => {
      const response = ITEM_LIKES;
      const endpoints = [{ route, response }];
      const { data } = await mockHook({ endpoints, hook, wrapper });

      expect(data).toEqual(response);

      // verify cache keys
      expect(queryClient.getQueryData<ItemLike[]>(key)).toEqual(response);
    });

    it(`Unauthorized`, async () => {
      const endpoints = [
        {
          route,
          response: UNAUTHORIZED_RESPONSE,
          statusCode: StatusCodes.UNAUTHORIZED,
        },
      ];
      const { data, isError } = await mockHook({
        hook,
        wrapper,
        endpoints,
      });

      expect(data).toBeFalsy();
      expect(isError).toBeTruthy();
      // verify cache keys
      expect(queryClient.getQueryData(key)).toBeFalsy();
    });
  });

  describe('useLikesForItem', () => {
    const itemId = ITEMS[0].id;
    const route = `/${buildGetItemLikesRoute(itemId)}`;
    const key = buildGetLikesForItem(itemId);

    const hook = () => hooks.useLikesForItem(itemId);

    it(`Receive item's like entries`, async () => {
      const response = ITEM_LIKES;
      const endpoints = [{ route, response }];
      const { data } = await mockHook({ endpoints, hook, wrapper });

      expect(data).toEqual(response);

      // verify cache keys
      expect(queryClient.getQueryData<ItemLike[]>(key)).toEqual(response);
    });

    it(`Unauthorized`, async () => {
      const endpoints = [
        {
          route,
          response: UNAUTHORIZED_RESPONSE,
          statusCode: StatusCodes.UNAUTHORIZED,
        },
      ];
      const { data, isError } = await mockHook({
        hook,
        wrapper,
        endpoints,
      });

      expect(data).toBeFalsy();
      expect(isError).toBeTruthy();
      // verify cache keys
      expect(queryClient.getQueryData(key)).toBeFalsy();
    });
  });
});

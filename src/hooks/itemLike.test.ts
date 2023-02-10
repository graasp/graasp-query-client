// eslint-disable-next-line import/no-extraneous-dependencies
import { StatusCodes } from 'http-status-codes';
import { List } from 'immutable';
import Cookies from 'js-cookie';
import nock from 'nock';

import { ItemLikeRecord } from '@graasp/sdk/frontend';

import {
  ITEMS,
  ITEM_LIKES,
  LIKE_COUNT,
  UNAUTHORIZED_RESPONSE,
} from '../../test/constants';
import { mockHook, setUpTest } from '../../test/utils';
import { buildGetLikeCountRoute, buildGetLikedItemsRoute } from '../api/routes';
import { buildGetLikeCountKey, buildGetLikedItemsKey } from '../config/keys';

const { hooks, wrapper, queryClient } = setUpTest();
jest.spyOn(Cookies, 'get').mockReturnValue({ session: 'somesession' });

describe('Item Like Hooks', () => {
  afterEach(() => {
    nock.cleanAll();
    queryClient.clear();
  });

  describe('useLikedItems', () => {
    const memberId = 'member-id';
    const route = `/${buildGetLikedItemsRoute(memberId)}`;
    const key = buildGetLikedItemsKey(memberId);

    const hook = () => hooks.useLikedItems(memberId);

    it(`Receive item likes`, async () => {
      const response = ITEM_LIKES;
      const endpoints = [{ route, response }];
      const { data } = await mockHook({ endpoints, hook, wrapper });

      expect(data as List<ItemLikeRecord>).toEqualImmutable(response);

      // verify cache keys
      expect(queryClient.getQueryData(key)).toEqualImmutable(response);
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

  describe('useLikeCount', () => {
    const itemId = ITEMS.first()!.id;
    const route = `/${buildGetLikeCountRoute(itemId)}`;
    const key = buildGetLikeCountKey(itemId);

    const hook = () => hooks.useLikeCount(itemId);

    it(`Receive item like count`, async () => {
      const response = LIKE_COUNT;
      const endpoints = [{ route, response }];
      const { data } = await mockHook({ endpoints, hook, wrapper });

      expect(data as typeof LIKE_COUNT).toEqual(response);

      // verify cache keys
      expect(queryClient.getQueryData(key)).toEqual(response);
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

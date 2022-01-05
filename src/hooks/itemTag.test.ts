/* eslint-disable import/no-extraneous-dependencies */
import nock from 'nock';
import { StatusCodes } from 'http-status-codes';
import Cookies from 'js-cookie';
import { List } from 'immutable';
import { buildGetItemTagsRoute, GET_TAGS_ROUTE } from '../api/routes';
import { mockHook, setUpTest } from '../../test/utils';
import { ITEMS, TAGS, UNAUTHORIZED_RESPONSE } from '../../test/constants';
import { buildItemTagsKey, TAGS_KEY } from '../config/keys';
import { ItemTag } from '../types';

const { hooks, wrapper, queryClient } = setUpTest();

jest.spyOn(Cookies, 'get').mockReturnValue({ session: 'somesession' });

describe('Item Tags Hooks', () => {
  afterEach(() => {
    nock.cleanAll();
    queryClient.clear();
  });

  describe('useTags', () => {
    const route = `/${GET_TAGS_ROUTE}`;
    const key = TAGS_KEY;

    const hook = () => hooks.useTags();

    it(`Receive tags`, async () => {
      const response = TAGS;
      const endpoints = [{ route, response }];
      const { data, isSuccess } = await mockHook({ endpoints, hook, wrapper });

      expect((data as List<ItemTag>).toJS()).toEqual(response);

      // verify cache keys
      expect(queryClient.getQueryData(key)).toEqual(List(response));
      expect(isSuccess).toBeTruthy();
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

  describe('useItemTags', () => {
    const itemId = ITEMS[0].id;
    const route = `/${buildGetItemTagsRoute(itemId)}`;
    const key = buildItemTagsKey(itemId);

    const hook = () => hooks.useItemTags(itemId);

    it(`Receive tags of given item`, async () => {
      const response = TAGS;
      const endpoints = [{ route, response }];
      const { data, isSuccess } = await mockHook({ endpoints, hook, wrapper });

      expect((data as List<typeof TAGS[0]>).toJS()).toEqual(response);

      // verify cache keys
      expect(queryClient.getQueryData(key)).toEqual(List(response));
      expect(isSuccess).toBeTruthy();
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

import { StatusCodes } from 'http-status-codes';
import { List } from 'immutable';
import Cookies from 'js-cookie';
import nock from 'nock';

import { ItemRecord } from '@graasp/sdk/frontend';

import { ITEMS, UNAUTHORIZED_RESPONSE } from '../../test/constants';
import { mockHook, setUpTest } from '../../test/utils';
import { buildGetItemsByKeywordRoute } from '../api/routes';
import { buildSearchByKeywordKey } from '../config/keys';

const { hooks, wrapper, queryClient } = setUpTest();
jest.spyOn(Cookies, 'get').mockReturnValue({ session: 'somesession' });

describe('Keyword Search Hook', () => {
  afterEach(() => {
    nock.cleanAll();
    queryClient.clear();
  });

  describe('useKeywordSearch', () => {
    const keywords = 'cat&dog';
    const route = `/${buildGetItemsByKeywordRoute({ keywords })}`;
    const key = buildSearchByKeywordKey({ keywords });

    const hook = () => hooks.useKeywordSearch({ keywords });

    it(`Receive search results`, async () => {
      const response = ITEMS;
      const endpoints = [{ route, response }];
      const { data } = await mockHook({ endpoints, hook, wrapper });

      expect(data as List<ItemRecord>).toEqualImmutable(response);

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
});

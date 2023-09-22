import { FlagType } from '@graasp/sdk';

import Immutable, { List } from 'immutable';
import Cookies from 'js-cookie';
import nock from 'nock';

import { Endpoint, mockHook, setUpTest } from '../../test/utils';
import { GET_FLAGS_ROUTE } from '../api/routes';
import { ITEM_FLAGS_KEY } from '../config/keys';

const { hooks, wrapper, queryClient } = setUpTest();
jest.spyOn(Cookies, 'get').mockReturnValue({ session: 'somesession' });

describe('Item Flag Hooks', () => {
  afterEach(() => {
    nock.cleanAll();
    queryClient.clear();
  });

  describe('useFlags', () => {
    const key = ITEM_FLAGS_KEY;

    const hook = () => hooks.useFlags();

    it(`Receive flags`, async () => {
      const response = Object.values(FlagType);
      const endpoints: Endpoint[] = [
        {
          response,
          route: `/${GET_FLAGS_ROUTE}`,
        },
      ];
      const { data } = await mockHook({ endpoints, hook, wrapper });

      expect(Immutable.is(data, List(response))).toBeTruthy();

      // verify cache keys
      expect(
        Immutable.is(queryClient.getQueryData(key), List(response)),
      ).toBeTruthy();
    });
  });
});

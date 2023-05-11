import { StatusCodes } from 'http-status-codes';
import Cookies from 'js-cookie';

import { FAVORITE_ITEM, UNAUTHORIZED_RESPONSE } from '../../test/constants';
import { mockHook, setUpTest } from '../../test/utils';
import {
  FAVORITE_ITEMS_KEY,
} from '../config/keys';
import { GET_FAVORITE_ITEMS_ROUTE } from '../api/routes';

const { hooks, wrapper, queryClient } = setUpTest();
jest.spyOn(Cookies, 'get').mockReturnValue({ session: 'somesession' });

  describe('useLikesForItem', () => {
    const route = `/${GET_FAVORITE_ITEMS_ROUTE}`;
    const key = FAVORITE_ITEMS_KEY;

    const hook = () => hooks.useFavoriteItems();

    it(`Retrieve favorite items`, async () => {
      const response = FAVORITE_ITEM;
      const endpoints = [{ route, response: response.toJS() }];
      await mockHook({ endpoints, hook, wrapper });

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

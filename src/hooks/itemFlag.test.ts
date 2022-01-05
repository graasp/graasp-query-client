// eslint-disable-next-line import/no-extraneous-dependencies
import nock from 'nock';
import Cookies from 'js-cookie';
import { StatusCodes } from 'http-status-codes';
import { List } from 'immutable';
import { GET_FLAGS_ROUTE } from '../api/routes';
import { mockHook, setUpTest } from '../../test/utils';
import { FLAGS, UNAUTHORIZED_RESPONSE } from '../../test/constants';
import { ITEM_FLAGS_KEY } from '../config/keys';

const { hooks, wrapper, queryClient } = setUpTest();
jest.spyOn(Cookies, 'get').mockReturnValue({ session: 'somesession' });

describe('Item Flag Hooks', () => {
  afterEach(() => {
    nock.cleanAll();
    queryClient.clear();
  });

  describe('useFlags', () => {
    const route = `/${GET_FLAGS_ROUTE}`;
    const key = ITEM_FLAGS_KEY;

    const hook = () => hooks.useFlags();

    it(`Receive flags`, async () => {
      const response = FLAGS;
      const endpoints = [{ route, response }];
      const { data } = await mockHook({ endpoints, hook, wrapper });

      expect((data as List<typeof FLAGS[0]>).toJS()).toEqual(response);

      // verify cache keys
      expect(queryClient.getQueryData(key)).toEqual(List(response));
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

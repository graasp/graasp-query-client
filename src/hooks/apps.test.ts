/* eslint-disable import/no-extraneous-dependencies */
import nock from 'nock';
import { List, RecordOf } from 'immutable';
import { StatusCodes } from 'http-status-codes';
import Cookies from 'js-cookie';
import { buildAppListRoute } from '../api/routes';
import { mockHook, setUpTest } from '../../test/utils';
import { APPS, UNAUTHORIZED_RESPONSE } from '../../test/constants';
import { APPS_KEY } from '../config/keys';

const { hooks, wrapper, queryClient } = setUpTest();

jest.spyOn(Cookies, 'get').mockReturnValue({ session: 'somesession' });
describe('Apps Hooks', () => {
  afterEach(() => {
    nock.cleanAll();
    queryClient.clear();
  });

  describe('useApps', () => {
    const route = `/${buildAppListRoute}`;
    const key = APPS_KEY;

    const hook = () => hooks.useApps();

    it(`Receive list of apps`, async () => {
      const response = APPS;
      const endpoints = [{ route, response }];
      const { data } = await mockHook({ endpoints, hook, wrapper });

      expect((data as List<RecordOf<any>>)).toEqualImmutable(response);

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

import { App } from '@graasp/sdk';

import { StatusCodes } from 'http-status-codes';
import nock from 'nock';
import { afterEach, describe, expect, it } from 'vitest';

import { APPS, UNAUTHORIZED_RESPONSE } from '../../test/constants.js';
import { mockHook, setUpTest } from '../../test/utils.js';
import { APPS_KEY } from '../keys.js';
import { buildAppListRoute } from '../routes.js';

const { hooks, wrapper, queryClient } = setUpTest();

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

      expect(data).toEqual(response);

      // verify cache keys
      expect(queryClient.getQueryData<App[]>(key)).toEqual(response);
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

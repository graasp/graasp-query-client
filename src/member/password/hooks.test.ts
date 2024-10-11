import { StatusCodes } from 'http-status-codes';
import nock from 'nock';
import { afterEach, describe, expect, it } from 'vitest';

import { UNAUTHORIZED_RESPONSE } from '../../../test/constants.js';
import { mockHook, setUpTest } from '../../../test/utils.js';
import { memberKeys } from '../../keys.js';
import { buildGetPasswordStatusRoute } from './routes.js';

const { hooks, wrapper, queryClient } = setUpTest();
describe('Member Hooks', () => {
  afterEach(() => {
    queryClient.clear();
    nock.cleanAll();
  });

  describe('usePasswordStatus', () => {
    const route = `/${buildGetPasswordStatusRoute()}`;
    const hook = hooks.usePasswordStatus;
    const key = memberKeys.current().passwordStatus;

    it(`Receive password status`, async () => {
      const response = { hasPassword: true };
      const endpoints = [{ route, response }];
      const { data } = await mockHook({ endpoints, hook, wrapper });

      expect(data).toMatchObject(response);
      // verify cache keys
      expect(queryClient.getQueryData(key)).toMatchObject(data!);
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
        endpoints,
        hook,
        wrapper,
      });

      expect(data).toBeFalsy();

      expect(isError).toBeTruthy();
      expect(queryClient.getQueryData(key)).toBeFalsy();
    });
  });
});

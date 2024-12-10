import { TagFactory } from '@graasp/sdk';

import { StatusCodes } from 'http-status-codes';
import nock from 'nock';
import { afterEach, describe, expect, it } from 'vitest';

import { UNAUTHORIZED_RESPONSE } from '../../../test/constants.js';
import { mockHook, setUpTest } from '../../../test/utils.js';
import { itemKeys } from '../../keys.js';
import { buildGetTagsByItemRoute } from './routes.js';

const { hooks, wrapper, queryClient } = setUpTest();

describe('Tags Hooks', () => {
  afterEach(() => {
    nock.cleanAll();
    queryClient.clear();
  });

  describe('useTagsByItem', () => {
    const itemId = 'item-id';
    const route = `/${buildGetTagsByItemRoute({ itemId })}`;
    const key = itemKeys.single(itemId).tags;

    const hook = () => hooks.useTagsByItem({ itemId });

    it(`Receive item categories`, async () => {
      const response = [TagFactory()];
      const endpoints = [{ route, response }];
      const { data } = await mockHook({ endpoints, hook, wrapper });

      expect(data).toMatchObject(response);

      // verify cache keys
      expect(queryClient.getQueryData(key)).toMatchObject(response);
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

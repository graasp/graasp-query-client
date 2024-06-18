import { StatusCodes } from 'http-status-codes';
import nock from 'nock';
import { afterEach, describe, expect, it } from 'vitest';

import {
  ITEM_VALIDATION_GROUP,
  UNAUTHORIZED_RESPONSE,
} from '../../test/constants.js';
import { mockHook, setUpTest } from '../../test/utils.js';
import { itemKeys } from '../keys.js';
import { buildGetLastItemValidationGroupRoute } from '../routes.js';

const { hooks, wrapper, queryClient } = setUpTest();

describe('Item Validation Hooks', () => {
  afterEach(() => {
    nock.cleanAll();
    queryClient.clear();
  });

  describe('useLastItemValidationGroup', () => {
    const iVId = 'item-validation-id';
    const route = `/${buildGetLastItemValidationGroupRoute(iVId)}`;
    const key = itemKeys.single(iVId).validation;

    const hook = () => hooks.useLastItemValidationGroup(iVId);

    it(`Receive last item validation group of given item-validation-id`, async () => {
      const response = ITEM_VALIDATION_GROUP;
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

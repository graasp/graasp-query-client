import { PublicationStatus } from '@graasp/sdk';

import { StatusCodes } from 'http-status-codes';
import nock from 'nock';
import { afterEach, describe, expect, it } from 'vitest';

import { UNAUTHORIZED_RESPONSE } from '../../../test/constants.js';
import { mockHook, setUpTest } from '../../../test/utils.js';
import { itemKeys } from '../../keys.js';
import { buildGetPublicationStatusRoute } from '../../routes.js';

const { hooks, wrapper, queryClient } = setUpTest();

describe('Item Publication Hooks', () => {
  afterEach(() => {
    nock.cleanAll();
    queryClient.clear();
  });

  describe('usePublicationStatus', () => {
    const itemId = 'item-id';
    const route = `/${buildGetPublicationStatusRoute(itemId)}`;
    const key = itemKeys.single(itemId).publicationStatus;

    const hook = () => hooks.usePublicationStatus(itemId);

    it(`Receive last publication status for the given item id`, async () => {
      const response = PublicationStatus.Unpublished;
      const endpoints = [{ route, response }];
      const { data } = await mockHook({ endpoints, hook, wrapper });

      expect(data).toEqual(response);

      // verify cache keys
      expect(queryClient.getQueryData<string>(key)).toEqual(response);
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

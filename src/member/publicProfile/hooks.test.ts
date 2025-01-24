import { StatusCodes } from 'http-status-codes';
import nock from 'nock';
import { afterEach, describe, expect, it } from 'vitest';

import {
  MEMBER_PUBLIC_PROFILE,
  UNAUTHORIZED_RESPONSE,
} from '../../../test/constants.js';
import { mockHook, setUpTest } from '../../../test/utils.js';
import { memberKeys } from '../../keys.js';
import {
  buildGetOwnPublicProfileRoute,
  buildGetPublicProfileRoute,
} from '../routes.js';

const { hooks, wrapper, queryClient } = setUpTest();

describe('Public Profile Hooks', () => {
  afterEach(() => {
    nock.cleanAll();
    queryClient.clear();
  });

  describe('useOwnProfile', () => {
    const route = `/${buildGetOwnPublicProfileRoute()}`;

    const response = MEMBER_PUBLIC_PROFILE;

    const hook = () => hooks.useOwnProfile();
    it('Receive own profile', async () => {
      const endpoints = [{ route, response }];
      const { data } = await mockHook({ endpoints, hook, wrapper });
      expect(data).toEqual(response);
      expect(queryClient.getQueryData(memberKeys.current().profile)).toEqual(
        response,
      );
    });

    it('Own profile does not exist, data should be null', async () => {
      const endpoints = [
        {
          route,
          // set a string on the response to see if it will be set in the query client: it should not, the key value should be "null"
          response: 'toto',
          statusCode: StatusCodes.NO_CONTENT,
        },
      ];
      const { data } = await mockHook({ endpoints, hook, wrapper });
      expect(data).toBeNull();
      expect(queryClient.getQueryData(memberKeys.current().profile)).toBeNull();
    });

    it('Unauthorized', async () => {
      const endpoints = [
        {
          route,
          response: UNAUTHORIZED_RESPONSE,
          statusCode: StatusCodes.UNAUTHORIZED,
        },
      ];
      const { isError } = await mockHook({
        endpoints,
        hook,
        wrapper,
      });

      expect(isError).toBeTruthy();
      expect(
        queryClient.getQueryData(memberKeys.current().profile),
      ).toBeFalsy();
    });
  });

  describe('usePublicProfile', () => {
    const id = 'member-id';
    const response = MEMBER_PUBLIC_PROFILE;
    const route = `/${buildGetPublicProfileRoute(id)}`;
    const hook = () => hooks.usePublicProfile(id);

    it(`Receive member public profile for member-id = ${id}`, async () => {
      const endpoints = [
        {
          route,
          response,
        },
      ];
      const { data } = await mockHook({
        hook,
        wrapper,
        endpoints,
      });
      expect(queryClient.getQueryData(memberKeys.single(id).profile)).toEqual(
        response,
      );
      expect(data).toMatchObject(response);
    });

    it('Member profile does not exist, data should be null', async () => {
      const endpoints = [
        {
          route,
          // set a string on the response to see if it will be set in the query client: it should not, the key value should be "null"
          response: 'toto',
          statusCode: StatusCodes.NO_CONTENT,
        },
      ];

      const { data } = await mockHook({ endpoints, hook, wrapper });
      expect(data).toBeNull();
      expect(
        queryClient.getQueryData(memberKeys.single(id).profile),
      ).toBeNull();
    });
  });
});

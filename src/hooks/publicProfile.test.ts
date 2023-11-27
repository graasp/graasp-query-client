import { StatusCodes } from 'http-status-codes';
import nock from 'nock';

import {
  MEMBER_PUBLIC_PROFILE,
  UNAUTHORIZED_RESPONSE,
} from '../../test/constants';
import { mockHook, setUpTest } from '../../test/utils';
import { GET_OWN_PROFILE, buildGetPublicProfileRoute } from '../api/routes';
import { OWN_PUBLIC_PROFILE_KEY, buildPublicProfileKey } from '../config/keys';

const { hooks, wrapper, queryClient } = setUpTest();

describe('Public Profile Hooks', () => {
  afterEach(() => {
    nock.cleanAll();
    queryClient.clear();
  });

  describe('useOwnProfile', () => {
    const route = `/${GET_OWN_PROFILE}`;

    const response = MEMBER_PUBLIC_PROFILE;

    const hook = () => hooks.useOwnProfile();
    it(`Receive actions for item id`, async () => {
      const endpoints = [{ route, response }];
      const { data } = await mockHook({ endpoints, hook, wrapper });
      expect(data).toEqual(response);
      expect(queryClient.getQueryData(OWN_PUBLIC_PROFILE_KEY)).toEqual(
        response,
      );
    });

    it(`Unauthorized`, async () => {
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
      expect(queryClient.getQueryData(OWN_PUBLIC_PROFILE_KEY)).toBeFalsy();
    });
  });

  describe('usePublicProfile', () => {
    const id = 'member-id';
    const response = MEMBER_PUBLIC_PROFILE;

    it(`Receive member public profile for member-id = ${id}`, async () => {
      const endpoints = [
        {
          route: `/${buildGetPublicProfileRoute(id)}`,
          response,
        },
      ];
      const hook = () => hooks.usePublicProfile(id);
      const { data } = await mockHook({
        hook,
        wrapper,
        endpoints,
      });
      expect(queryClient.getQueryData(buildPublicProfileKey(id))).toEqual(
        response,
      );
      expect(data).toMatchObject(response);
    });
  });
});

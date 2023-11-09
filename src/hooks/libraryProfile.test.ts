import { StatusCodes } from 'http-status-codes';
import nock from 'nock';

import {
  MEMBER_PUBLIC_PROFILE,
  UNAUTHORIZED_RESPONSE,
} from '../../test/constants';
import { mockHook, setUpTest } from '../../test/utils';
import {
  GET_OWN_LIBRARY_PROFILE,
  buildGetMemberProfileRoute,
} from '../api/routes';

const { hooks, wrapper, queryClient } = setUpTest();

describe('Public Profile Hooks', () => {
  afterEach(() => {
    nock.cleanAll();
    queryClient.clear();
  });

  describe('useOwnProfile', () => {
    const route = `/${GET_OWN_LIBRARY_PROFILE}`;

    const response = MEMBER_PUBLIC_PROFILE;

    const hook = () => hooks.useOwnProfile();
    it(`Receive actions for item id`, async () => {
      const endpoints = [{ route, response }];
      const { data } = await mockHook({ endpoints, hook, wrapper });
      expect(data).toEqual(response);
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
    });
  });

  describe('useMemberProfile', () => {
    const id = 'member-id';
    const response = MEMBER_PUBLIC_PROFILE;

    it(`Receive member public profile for member-id = ${id}`, async () => {
      const endpoints = [
        {
          route: `/${buildGetMemberProfileRoute(id)}`,
          response,
        },
      ];
      const hook = () => hooks.useMemberProfile(id);
      const { data } = await mockHook({
        hook,
        wrapper,
        endpoints,
      });

      expect(data).toMatchObject(response);
    });
  });
});

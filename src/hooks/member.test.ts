import { StatusCodes } from 'http-status-codes';
import { Record } from 'immutable';
import nock from 'nock';
import { buildGetMember, GET_CURRENT_MEMBER_ROUTE } from '../api/routes';
import { mockHook, setUpTest } from '../../test/utils';
import { MEMBER_RESPONSE, UNAUTHORIZED_RESPONSE } from '../../test/constants';
import { buildMemberKey, CURRENT_MEMBER_KEY } from '../config/keys';
import type { Member } from '../types';
import { SIGNED_OUT_USER } from '../config/constants';

const { hooks, wrapper, queryClient } = setUpTest();
describe('Member Hooks', () => {
  afterEach(() => {
    queryClient.clear();
    nock.cleanAll();
  });

  describe('useCurrentMember', () => {
    const route = `/${GET_CURRENT_MEMBER_ROUTE}`;
    const hook = () => hooks.useCurrentMember();

    it(`Receive current member`, async () => {
      const response = MEMBER_RESPONSE;
      const endpoints = [{ route, response }];
      const { data } = await mockHook({ endpoints, hook, wrapper });

      expect((data as Record<Member>).toJS()).toEqual(response);
      // verify cache keys
      expect(queryClient.getQueryData(CURRENT_MEMBER_KEY)).toEqual(data);
    });

    it(`Unauthorized`, async () => {
      const endpoints = [
        {
          route,
          response: UNAUTHORIZED_RESPONSE,
          statusCode: StatusCodes.UNAUTHORIZED,
        },
      ];
      const { data, isSuccess } = await mockHook({
        endpoints,
        hook,
        wrapper,
      });

      // unauthorized request are translated to signed out user
      expect((data as Record<Member>).toJS()).toEqual(SIGNED_OUT_USER);
      expect(isSuccess).toBeTruthy();
      // verify cache keys
      expect(queryClient.getQueryData(CURRENT_MEMBER_KEY)).toEqual(data);
    });
  });

  describe('useMember', () => {
    const id = 'member-id';

    it(`Receive member id = ${id}`, async () => {
      const response = MEMBER_RESPONSE;
      const endpoints = [
        {
          route: `/${buildGetMember(id)}`,
          response,
        },
      ];
      const hook = () => hooks.useMember(id);
      const { data } = await mockHook({
        hook,
        wrapper,
        endpoints,
      });

      expect((data as Record<Member>).toJS()).toEqual(response);
      // verify cache keys
      expect(queryClient.getQueryData(buildMemberKey(id))).toEqual(data);
    });

    it(`Unauthorized`, async () => {
      const hook = () => hooks.useMember(id);
      const endpoints = [
        {
          route: `/${buildGetMember(id)}`,
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
      expect(queryClient.getQueryData(buildMemberKey(id))).toBeFalsy();
    });
  });
});

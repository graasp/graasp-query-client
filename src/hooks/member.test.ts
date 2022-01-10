/* eslint-disable import/no-extraneous-dependencies */
import nock from 'nock';
import Cookies from 'js-cookie';
import { StatusCodes } from 'http-status-codes';
import { Record, List } from 'immutable';
import {
  buildDownloadAvatarRoute,
  buildGetMember,
  buildGetMembersRoute,
  buildGetPublicMember,
  buildGetPublicMembersRoute,
  GET_CURRENT_MEMBER_ROUTE,
} from '../api/routes';
import { mockHook, setUpTest } from '../../test/utils';
import {
  AVATAR_BLOB_RESPONSE,
  MEMBERS_RESPONSE,
  MEMBER_RESPONSE,
  UNAUTHORIZED_RESPONSE,
} from '../../test/constants';
import {
  buildAvatarKey,
  buildMemberKey,
  buildMembersKey,
  CURRENT_MEMBER_KEY,
} from '../config/keys';
import type { Member, UUID } from '../types';
import { SIGNED_OUT_USER, THUMBNAIL_SIZES } from '../config/constants';

const { hooks, wrapper, queryClient } = setUpTest();
jest.spyOn(Cookies, 'get').mockReturnValue({ session: 'somesession' });
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
    const response = MEMBER_RESPONSE;

    it(`Receive member id = ${id}`, async () => {
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

    it(`Fallback to public`, async () => {
      const hook = () => hooks.useMember(id);
      const endpoints = [
        {
          route: `/${buildGetMember(id)}`,
          response: UNAUTHORIZED_RESPONSE,
          statusCode: StatusCodes.UNAUTHORIZED,
        },
        {
          route: `/${buildGetPublicMember(id)}`,
          response,
        },
      ];
      const { data } = await mockHook({
        hook,
        wrapper,
        endpoints,
      });

      expect((data as Record<Member>).toJS()).toEqual(response);
      // verify cache keys
      expect(queryClient.getQueryData(buildMemberKey(id))).toEqual(data);
    });
  });

  describe('useMembers', () => {
    const response = MEMBERS_RESPONSE;
    const ids = response.map(({ id }) => id);

    it(`Does not run for empty ids`, async () => {
      const emptyIds: UUID[] = [];
      const endpoints = [
        {
          route: `/${buildGetMembersRoute(emptyIds)}`,
          response,
        },
      ];
      const hook = () => hooks.useMembers(emptyIds);
      const { data } = await mockHook({
        hook,
        wrapper,
        endpoints,
        enabled: false,
      });

      expect(data).toBeFalsy();
      // verify cache keys
      expect(queryClient.getQueryData(buildMembersKey(emptyIds))).toBeFalsy();
    });

    it(`Receive one member`, async () => {
      const oneMemberResponse = [response[0]];
      const oneMemberIds = [oneMemberResponse[0].id];
      const endpoints = [
        {
          route: `/${buildGetMembersRoute(oneMemberIds)}`,
          response: oneMemberResponse,
        },
      ];
      const hook = () => hooks.useMembers(oneMemberIds);
      const { data } = await mockHook({
        hook,
        wrapper,
        endpoints,
      });

      const members = data as List<Member>;
      expect(members.toJS()).toEqual(oneMemberResponse);
      // verify cache keys
      expect(queryClient.getQueryData(buildMembersKey(oneMemberIds))).toEqual(
        data,
      );
      expect(
        queryClient
          .getQueryData<Record<Member>>(buildMemberKey(oneMemberIds[0]))
          ?.toJS(),
      ).toEqual(members.find(({ id: thisId }) => thisId === oneMemberIds[0]));
    });

    it(`Receive two members`, async () => {
      const endpoints = [
        {
          route: `/${buildGetMembersRoute(ids)}`,
          response,
        },
      ];
      const hook = () => hooks.useMembers(ids);
      const { data } = await mockHook({
        hook,
        wrapper,
        endpoints,
      });

      const members = data as List<Member>;
      expect(members.toJS()).toEqual(response);
      // verify cache keys
      expect(queryClient.getQueryData(buildMembersKey(ids))).toEqual(data);
      for (const id of ids) {
        expect(
          queryClient.getQueryData<Record<Member>>(buildMemberKey(id))?.toJS(),
        ).toEqual(members.find(({ id: thisId }) => thisId === id));
      }
    });

    it(`Unauthorized`, async () => {
      const hook = () => hooks.useMembers(ids);
      const endpoints = [
        {
          route: `/${buildGetMembersRoute(ids)}`,
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
      expect(queryClient.getQueryData(buildMembersKey(ids))).toBeFalsy();
      for (const id of ids) {
        expect(
          queryClient.getQueryData<Record<Member>>(buildMemberKey(id))?.toJS(),
        ).toBeFalsy();
      }
    });

    it(`Fallback to public`, async () => {
      const endpoints = [
        {
          route: `/${buildGetMembersRoute(ids)}`,
          response: UNAUTHORIZED_RESPONSE,
          statusCode: StatusCodes.UNAUTHORIZED,
        },
        {
          route: `/${buildGetPublicMembersRoute(ids)}`,
          response,
        },
      ];
      const hook = () => hooks.useMembers(ids);
      const { data } = await mockHook({
        hook,
        wrapper,
        endpoints,
      });

      const members = data as List<Member>;
      expect(members.toJS()).toEqual(response);
      // verify cache keys
      expect(queryClient.getQueryData(buildMembersKey(ids))).toEqual(data);
      for (const id of ids) {
        expect(
          queryClient.getQueryData<Record<Member>>(buildMemberKey(id))?.toJS(),
        ).toEqual(members.find(({ id: thisId }) => thisId === id));
      }
    });
  });

  describe('useAvatar', () => {
    const member = MEMBER_RESPONSE;

    const response = AVATAR_BLOB_RESPONSE;
    const route = `/${buildDownloadAvatarRoute({ id: member.id })}`;
    const hook = () => hooks.useAvatar({ id: member.id });
    const key = buildAvatarKey({ id: member.id });

    it(`Receive default avatar`, async () => {
      const endpoints = [
        { route, response, headers: { 'Content-Type': 'image/jpeg' } },
      ];
      const { data } = await mockHook({ endpoints, hook, wrapper });

      expect(data).toBeTruthy();
      // verify cache keys
      expect(queryClient.getQueryData(key)).toBeTruthy();
    });

    it(`Receive large avatar`, async () => {
      const size = THUMBNAIL_SIZES.LARGE;
      const routeLarge = `/${buildDownloadAvatarRoute({
        id: member.id,
        size,
      })}`;
      const hookLarge = () => hooks.useAvatar({ id: member.id, size });
      const keyLarge = buildAvatarKey({ id: member.id, size });

      const endpoints = [
        {
          route: routeLarge,
          response,
          headers: { 'Content-Type': 'image/jpeg' },
        },
      ];
      const { data } = await mockHook({
        endpoints,
        hook: hookLarge,
        wrapper,
      });

      expect(data).toBeTruthy();
      // verify cache keys
      expect(queryClient.getQueryData(keyLarge)).toBeTruthy();
    });

    it(`Undefined id does not fetch`, async () => {
      const endpoints = [
        {
          route,
          response,
        },
      ];
      const { data, isFetched } = await mockHook({
        endpoints,
        hook: () => hooks.useAvatar({ id: undefined }),
        wrapper,
        enabled: false,
      });

      expect(data).toBeFalsy();
      expect(isFetched).toBeFalsy();
      // verify cache keys
      expect(queryClient.getQueryData(key)).toBeFalsy();
    });

    it(`Unauthorized`, async () => {
      const endpoints = [
        {
          route,
          response: UNAUTHORIZED_RESPONSE,
          statusCode: StatusCodes.UNAUTHORIZED,
        },
      ];
      const { data, isError } = await mockHook({ endpoints, hook, wrapper });

      expect(data).toBeFalsy();
      expect(isError).toBeTruthy();
      // verify cache keys
      expect(queryClient.getQueryData(key)).toBeFalsy();
    });
  });
});

import {
  MAX_TARGETS_FOR_READ_REQUEST,
  Member,
  MemberFactory,
  MemberStorage,
  ResultOf,
  ThumbnailSize,
  UUID,
} from '@graasp/sdk';

import { StatusCodes } from 'http-status-codes';
import nock from 'nock';

import {
  AVATAR_BLOB_RESPONSE,
  AVATAR_URL_RESPONSE,
  FILE_NOT_FOUND_RESPONSE,
  UNAUTHORIZED_RESPONSE,
  buildResultOfData,
  generateMembers,
} from '../../test/constants';
import { mockHook, setUpTest, splitEndpointByIds } from '../../test/utils';
import {
  GET_CURRENT_MEMBER_ROUTE,
  buildDownloadAvatarRoute,
  buildGetMember,
  buildGetMemberStorage,
  buildGetMembersRoute,
} from '../api/routes';
import { memberKeys } from '../config/keys';

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
      const response = MemberFactory();
      const endpoints = [{ route, response }];
      const { data } = await mockHook({ endpoints, hook, wrapper });

      expect(data).toMatchObject(response);
      // verify cache keys
      expect(
        queryClient.getQueryData(memberKeys.current().content),
      ).toMatchObject(data!);
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
      expect(data).toBeNull();
      expect(isSuccess).toBeTruthy();
      expect(queryClient.getQueryData(memberKeys.current().content)).toBeNull();
    });
  });

  describe('useMember', () => {
    const id = 'member-id';
    const response = MemberFactory();

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

      expect(data).toMatchObject(response);
      // verify cache keys
      expect(
        queryClient.getQueryData(memberKeys.single(id).content),
      ).toMatchObject(data!);
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
      expect(
        queryClient.getQueryData(memberKeys.single(id).content),
      ).toBeFalsy();
    });
  });

  describe('useMembers', () => {
    const response = generateMembers(MAX_TARGETS_FOR_READ_REQUEST + 1);
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
      expect(queryClient.getQueryData(memberKeys.many(emptyIds))).toBeFalsy();
    });

    it(`Receive one member`, async () => {
      const m = response[0];
      const oneMemberResponse = buildResultOfData([m]);
      const oneMemberIds = [m.id];
      const endpoints = [
        {
          route: `/${buildGetMembersRoute(oneMemberIds)}`,
          response: oneMemberResponse,
        },
      ];
      const hook = () => hooks.useMembers(oneMemberIds);
      const { data: members } = await mockHook({
        hook,
        wrapper,
        endpoints,
      });

      expect(members).toEqual(oneMemberResponse);
      // verify cache keys
      expect(queryClient.getQueryData(memberKeys.many(oneMemberIds))).toEqual(
        members,
      );
      expect(
        queryClient.getQueryData(memberKeys.single(m.id).content),
      ).toMatchObject(m);
    });

    it(`Receive two members`, async () => {
      const twoMembers = response.slice(0, 2);
      const twoIds = twoMembers.map(({ id }) => id);
      const endpointResponse = buildResultOfData(twoMembers);
      const endpoints = [
        {
          route: `/${buildGetMembersRoute(twoIds)}`,
          response: endpointResponse,
        },
      ];
      const hook = () => hooks.useMembers(twoIds);
      const { data: members } = await mockHook({
        hook,
        wrapper,
        endpoints,
      });

      expect(members).toEqual(endpointResponse);
      // verify cache keys
      expect(
        queryClient.getQueryData<ResultOf<Member>>(memberKeys.many(twoIds)),
      ).toEqual(endpointResponse);
      for (const id of twoIds) {
        expect(
          queryClient.getQueryData<Member>(memberKeys.single(id).content),
        ).toMatchObject(twoMembers.find(({ id: thisId }) => thisId === id)!);
      }
    });

    it(`Receive lots of members`, async () => {
      const endpoints = splitEndpointByIds(
        ids,
        MAX_TARGETS_FOR_READ_REQUEST,
        (chunk) => `/${buildGetMembersRoute(chunk)}`,
        response,
      );
      const fullResponse = buildResultOfData(response);

      const hook = () => hooks.useMembers(ids);
      const { data: members } = await mockHook({
        hook,
        wrapper,
        endpoints,
      });

      expect(members).toEqual(fullResponse);
      // verify cache keys
      expect(
        queryClient.getQueryData<ResultOf<Member>>(memberKeys.many(ids)),
      ).toEqual(fullResponse);
      for (const id of ids) {
        expect(
          queryClient.getQueryData<Member>(memberKeys.single(id).content),
        ).toMatchObject(response.find(({ id: thisId }) => thisId === id)!);
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
      expect(queryClient.getQueryData(memberKeys.many(ids))).toBeFalsy();
      for (const id of ids) {
        expect(
          queryClient.getQueryData<Member>(memberKeys.single(id).content),
        ).toBeFalsy();
      }
    });

    // TODO: errors
  });

  describe('useAvatar', () => {
    const member = MemberFactory();
    const replyUrl = false;
    const response = AVATAR_BLOB_RESPONSE;
    const route = `/${buildDownloadAvatarRoute({ id: member.id, replyUrl })}`;
    const hook = () => hooks.useAvatar({ id: member.id });
    const key = memberKeys.single(member.id).avatar({ replyUrl });

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
      const size = ThumbnailSize.Large;
      const routeLarge = `/${buildDownloadAvatarRoute({
        id: member.id,
        replyUrl,
        size,
      })}`;
      const hookLarge = () => hooks.useAvatar({ id: member.id, size });
      const keyLarge = memberKeys.single(member.id).avatar({ size, replyUrl });

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

    it(`Error fetching avatar`, async () => {
      const endpoints = [
        {
          route,
          response: FILE_NOT_FOUND_RESPONSE,
          statusCode: StatusCodes.NOT_FOUND,
        },
      ];
      const { data, isFetched, isError } = await mockHook({
        endpoints,
        hook: () => hooks.useAvatar({ id: member.id }),
        wrapper,
      });

      expect(data).toBeFalsy();
      expect(isFetched).toBeTruthy();
      expect(isError).toBeTruthy();
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

  describe('useAvatarUrl', () => {
    const member = MemberFactory();
    const replyUrl = true;
    const response = AVATAR_URL_RESPONSE;
    const route = `/${buildDownloadAvatarRoute({ id: member.id, replyUrl })}`;
    const hook = () => hooks.useAvatarUrl({ id: member.id });
    const key = memberKeys.single(member.id).avatar({ replyUrl });

    it(`Receive default avatar url`, async () => {
      const endpoints = [{ route, response }];
      const { data } = await mockHook({ endpoints, hook, wrapper });
      expect(data).toBeTruthy();
      // verify cache keys
      expect(queryClient.getQueryData(key)).toBeTruthy();
    });

    it(`Receive large avatar url`, async () => {
      const size = ThumbnailSize.Large;
      const routeLarge = `/${buildDownloadAvatarRoute({
        id: member.id,
        replyUrl,
        size,
      })}`;
      const hookLarge = () => hooks.useAvatarUrl({ id: member.id, size });
      const keyLarge = memberKeys.single(member.id).avatar({ size, replyUrl });

      const endpoints = [
        {
          route: routeLarge,
          response,
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

    it(`Error fetching avatar`, async () => {
      const endpoints = [
        {
          route,
          response: FILE_NOT_FOUND_RESPONSE,
          statusCode: StatusCodes.NOT_FOUND,
        },
      ];
      const { data, isFetched, isError } = await mockHook({
        endpoints,
        hook: () => hooks.useAvatar({ id: member.id }),
        wrapper,
      });

      expect(data).toBeFalsy();
      expect(isFetched).toBeTruthy();
      expect(isError).toBeTruthy();
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

  describe('useMemberStorage', () => {
    const response: MemberStorage = { current: 123, maximum: 123 };
    const route = `/${buildGetMemberStorage()}`;
    const hook = () => hooks.useMemberStorage();
    const key = memberKeys.current().storage;

    it(`Receive member storage`, async () => {
      const endpoints = [{ route, response }];
      const { data } = await mockHook({ endpoints, hook, wrapper });
      expect(data).toBeTruthy();
      // verify cache keys
      expect(queryClient.getQueryData(key)).toBeTruthy();
    });

    it(`Error getting storage`, async () => {
      const endpoints = [
        {
          route,
          response: { error: 'error' },
          statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        },
      ];
      const { data, isFetched, isError } = await mockHook({
        endpoints,
        hook: () => hooks.useMemberStorage(),
        wrapper,
      });

      expect(data).toBeFalsy();
      expect(isFetched).toBeTruthy();
      expect(isError).toBeTruthy();
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

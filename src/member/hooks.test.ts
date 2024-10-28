import {
  AccountFactory,
  MAX_TARGETS_FOR_READ_REQUEST,
  Member,
  MemberFactory,
  MemberStorage,
  Pagination,
  ResultOf,
  ThumbnailSize,
  UUID,
} from '@graasp/sdk';

import { StatusCodes } from 'http-status-codes';
import nock from 'nock';
import { afterEach, describe, expect, it } from 'vitest';

import {
  AVATAR_BLOB_RESPONSE,
  AVATAR_URL_RESPONSE,
  FILE_NOT_FOUND_RESPONSE,
  UNAUTHORIZED_RESPONSE,
  buildResultOfData,
  generateMembers,
} from '../../test/constants.js';
import { mockHook, setUpTest, splitEndpointByIds } from '../../test/utils.js';
import { memberKeys } from '../keys.js';
import { MEMBER_STORAGE_ITEM_RESPONSE } from './fixtures.js';
import {
  buildDownloadAvatarRoute,
  buildGetCurrentMemberRoute,
  buildGetMemberRoute,
  buildGetMemberStorageFilesRoute,
  buildGetMemberStorageRoute,
  buildGetMembersByIdRoute,
} from './routes.js';

const { hooks, wrapper, queryClient } = setUpTest();
describe('Member Hooks', () => {
  afterEach(() => {
    queryClient.clear();
    nock.cleanAll();
  });

  describe('useCurrentMember', () => {
    const route = `/api/${buildGetCurrentMemberRoute()}`;
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
    const response = AccountFactory();

    it(`Receive member id = ${id}`, async () => {
      const endpoints = [
        {
          route: `/${buildGetMemberRoute(id)}`,
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
          route: `/${buildGetMemberRoute(id)}`,
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
          route: `/${buildGetMembersByIdRoute(emptyIds)}`,
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
          route: `/${buildGetMembersByIdRoute(oneMemberIds)}`,
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
    });

    it(`Receive two members`, async () => {
      const twoMembers = response.slice(0, 2);
      const twoIds = twoMembers.map(({ id }) => id);
      const endpointResponse = buildResultOfData(twoMembers);
      const endpoints = [
        {
          route: `/${buildGetMembersByIdRoute(twoIds)}`,
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
    });

    it(`Receive lots of members`, async () => {
      const endpoints = splitEndpointByIds(
        ids,
        MAX_TARGETS_FOR_READ_REQUEST,
        (chunk) => `/${buildGetMembersByIdRoute(chunk)}`,
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
    });

    it(`Unauthorized`, async () => {
      const hook = () => hooks.useMembers(ids);
      const endpoints = [
        {
          route: `/${buildGetMembersByIdRoute(ids)}`,
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
    const account = AccountFactory();
    const replyUrl = false;
    const response = AVATAR_BLOB_RESPONSE;
    const route = `/${buildDownloadAvatarRoute({ id: account.id, replyUrl })}`;
    const hook = () => hooks.useAvatar({ id: account.id });
    const key = memberKeys.single(account.id).avatar({ replyUrl });

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
        id: account.id,
        replyUrl,
        size,
      })}`;
      const hookLarge = () => hooks.useAvatar({ id: account.id, size });
      const keyLarge = memberKeys.single(account.id).avatar({ size, replyUrl });

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
        hook: () => hooks.useAvatar({ id: account.id }),
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
    const member = AccountFactory();
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
    const route = `/${buildGetMemberStorageRoute()}`;
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

  describe('useMemberStorageFiles', () => {
    const mockPagination: Pagination = {
      page: 1,
      pageSize: 10,
    };
    const route = `/${buildGetMemberStorageFilesRoute(mockPagination)}`;
    const hook = () => hooks.useMemberStorageFiles(mockPagination);
    const key = memberKeys.current().storageFiles(mockPagination);

    it(`Receive member storage files`, async () => {
      const response = MEMBER_STORAGE_ITEM_RESPONSE;
      const endpoints = [{ route, response }];
      const { data } = await mockHook({ endpoints, hook, wrapper });
      expect(data).toEqual(response);
      expect(queryClient.getQueryData(key)).toEqual(response);
    });

    it(`Error getting storage files`, async () => {
      const errorResponse = { error: 'error' };
      const endpoints = [
        {
          route,
          response: errorResponse,
          statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        },
      ];
      const { data, isFetched, isError } = await mockHook({
        endpoints,
        hook,
        wrapper,
      });
      expect(data).toBeFalsy();
      expect(isFetched).toBeTruthy();
      expect(isError).toBeTruthy();
      // verify cache keys
      expect(queryClient.getQueryData(key)).toBeFalsy();
    });

    it(`Unauthorized`, async () => {
      const unauthorizedResponse = UNAUTHORIZED_RESPONSE;
      const endpoints = [
        {
          route,
          response: unauthorizedResponse,
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
      // verify cache keys
      expect(queryClient.getQueryData(key)).toBeFalsy();
    });
  });
});

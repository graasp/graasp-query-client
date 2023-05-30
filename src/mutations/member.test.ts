import { act } from '@testing-library/react-hooks';
import { StatusCodes } from 'http-status-codes';
import Cookies from 'js-cookie';
import nock from 'nock';

import { HttpMethod, ThumbnailSize, convertJs } from '@graasp/sdk';
import { MemberRecord } from '@graasp/sdk/frontend';
import { SUCCESS_MESSAGES } from '@graasp/translations';

import {
  AVATAR_BLOB_RESPONSE,
  MEMBER_RESPONSE,
  OK_RESPONSE,
  UNAUTHORIZED_RESPONSE,
} from '../../test/constants';
import { mockMutation, setUpTest, waitForMutation } from '../../test/utils';
import {
  SIGN_OUT_ROUTE,
  buildDeleteMemberRoute,
  buildPatchMember,
  buildUploadAvatarRoute,
} from '../api/routes';
import { CURRENT_MEMBER_KEY, buildAvatarKey } from '../config/keys';
import { addFavoriteItemRoutine, uploadAvatarRoutine } from '../routines';

jest.spyOn(Cookies, 'get').mockReturnValue({ session: 'somesession' });

const mockedNotifier = jest.fn();
const { wrapper, queryClient, mutations } = setUpTest({
  notifier: mockedNotifier,
});
describe('Member Mutations', () => {
  afterEach(() => {
    queryClient.clear();
    nock.cleanAll();
  });

  describe('useSignOut', () => {
    const route = `/${SIGN_OUT_ROUTE}`;
    const mutation = mutations.useSignOut;

    it(`Successfully sign out`, async () => {
      const endpoints = [{ route, response: OK_RESPONSE }];
      // set random data in cache
      queryClient.setQueryData(CURRENT_MEMBER_KEY, MEMBER_RESPONSE);

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        await mockedMutation.mutate(null);
        await waitForMutation();
      });

      // verify cache keys
      expect(queryClient.getQueryData(CURRENT_MEMBER_KEY)).toEqual(undefined);
    });

    it(`Unauthorized`, async () => {
      // set random data in cache
      queryClient.setQueryData(CURRENT_MEMBER_KEY, MEMBER_RESPONSE);
      const endpoints = [
        {
          method: HttpMethod.GET,
          response: UNAUTHORIZED_RESPONSE,
          statusCode: StatusCodes.UNAUTHORIZED,
          route,
        },
      ];
      const mockedMutation = await mockMutation({
        mutation,
        endpoints,
        wrapper,
      });

      await act(async () => {
        await mockedMutation.mutate(null);
        await waitForMutation();
      });

      // verify cache keys
      expect(queryClient.getQueryData(CURRENT_MEMBER_KEY)).toEqualImmutable(
        MEMBER_RESPONSE,
      );
    });
  });

  describe('useDeleteMember', () => {
    const memberId = 'member-id';

    const mutation = mutations.useDeleteMember;

    it(`Successfully delete member`, async () => {
      const endpoints = [
        {
          route: `/${buildDeleteMemberRoute(memberId)}`,
          method: HttpMethod.DELETE,
          response: OK_RESPONSE,
        },
        {
          route: `/${SIGN_OUT_ROUTE}`,
          response: OK_RESPONSE,
        },
      ];
      // set random data in cache
      queryClient.setQueryData(CURRENT_MEMBER_KEY, MEMBER_RESPONSE);

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        await mockedMutation.mutate({ id: memberId });
        await waitForMutation(2000);
      });

      // verify cache keys
      expect(queryClient.getQueryData(CURRENT_MEMBER_KEY)).toEqual(undefined);
    });

    it(`Unauthorized`, async () => {
      // set random data in cache
      queryClient.setQueryData(CURRENT_MEMBER_KEY, MEMBER_RESPONSE);
      const endpoints = [
        {
          method: HttpMethod.GET,
          response: UNAUTHORIZED_RESPONSE,
          statusCode: StatusCodes.UNAUTHORIZED,
          route: `/${buildDeleteMemberRoute(memberId)}`,
        },
      ];
      const mockedMutation = await mockMutation({
        mutation,
        endpoints,
        wrapper,
      });

      await act(async () => {
        await mockedMutation.mutate({ id: memberId });
        await waitForMutation();
      });

      // verify cache keys
      expect(queryClient.getQueryData(CURRENT_MEMBER_KEY)).toEqualImmutable(
        MEMBER_RESPONSE,
      );
    });
  });

  describe('useEditMember', () => {
    const id = 'member-id';
    const route = `/${buildPatchMember(id)}`;
    const newMember = { name: 'newname' };
    const mutation = mutations.useEditMember;

    it(`Successfully edit member id = ${id}`, async () => {
      const response = MEMBER_RESPONSE.set('name', newMember.name);

      // set random data in cache
      queryClient.setQueryData(CURRENT_MEMBER_KEY, MEMBER_RESPONSE);
      const endpoints = [
        {
          response,
          method: HttpMethod.PATCH,
          route,
        },
      ];
      const mockedMutation = await mockMutation({
        mutation,
        wrapper,
        endpoints,
      });

      await act(async () => {
        await mockedMutation.mutate({ id, member: newMember });
        await waitForMutation();
      });

      // verify cache keys
      const newData =
        queryClient.getQueryData<MemberRecord>(CURRENT_MEMBER_KEY);
      expect(newData).toEqualImmutable(response);
    });

    it(`Unauthorized`, async () => {
      // set random data in cache
      queryClient.setQueryData(CURRENT_MEMBER_KEY, MEMBER_RESPONSE);
      const endpoints = [
        {
          response: UNAUTHORIZED_RESPONSE,
          statusCode: StatusCodes.UNAUTHORIZED,
          method: HttpMethod.PATCH,
          route,
        },
      ];
      const mockedMutation = await mockMutation({
        mutation,
        wrapper,
        endpoints,
      });

      await act(async () => {
        await mockedMutation.mutate({ id, member: newMember });
        await waitForMutation();
      });

      // verify cache keys
      const oldData =
        queryClient.getQueryData<MemberRecord>(CURRENT_MEMBER_KEY);
      expect(oldData).toEqualImmutable(MEMBER_RESPONSE);
    });
  });

  describe('useUploadAvatar', () => {
    const mutation = mutations.useUploadAvatar;
    const member = MEMBER_RESPONSE;
    const replyUrl = true;
    const { id } = member;

    it('Upload avatar', async () => {
      const route = `/${buildUploadAvatarRoute()}`;

      // set data in cache
      Object.values(ThumbnailSize).forEach((size) => {
        const key = buildAvatarKey({ id, size, replyUrl });
        queryClient.setQueryData(key, Math.random());
      });

      const response = AVATAR_BLOB_RESPONSE;

      const endpoints = [
        {
          response,
          method: HttpMethod.POST,
          route,
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        await mockedMutation.mutate({ id, data: {} });
        await waitForMutation();
      });

      // verify member is still available
      // in real cases, the path should be different
      for (const size of Object.values(ThumbnailSize)) {
        const key = buildAvatarKey({ id, size, replyUrl });
        const state = queryClient.getQueryState(key);
        expect(state?.isInvalidated).toBeTruthy();
      }
      expect(mockedNotifier).toHaveBeenCalledWith({
        type: uploadAvatarRoutine.SUCCESS,
        payload: { message: SUCCESS_MESSAGES.UPLOAD_AVATAR },
      });
    });

    it('Unauthorized to upload an avatar', async () => {
      const route = `/${buildUploadAvatarRoute()}`;
      // set data in cache
      Object.values(ThumbnailSize).forEach((size) => {
        const key = buildAvatarKey({ id, size, replyUrl });
        queryClient.setQueryData(key, Math.random());
      });

      const response = UNAUTHORIZED_RESPONSE;

      const endpoints = [
        {
          response,
          statusCode: StatusCodes.UNAUTHORIZED,
          method: HttpMethod.POST,
          route,
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        await mockedMutation.mutate({ id, error: StatusCodes.UNAUTHORIZED });
        await waitForMutation();
      });

      // verify member is still available
      // in real cases, the path should be different
      for (const size of Object.values(ThumbnailSize)) {
        const key = buildAvatarKey({ id, size, replyUrl });
        const state = queryClient.getQueryState(key);
        expect(state?.isInvalidated).toBeTruthy();
      }
      expect(mockedNotifier).toHaveBeenCalledWith({
        type: uploadAvatarRoutine.FAILURE,
        payload: { error: StatusCodes.UNAUTHORIZED },
      });
    });
  });

  describe('useAddFavoriteItem', () => {
    const id = 'member-id';
    const itemId = 'item-id';
    const extra = {
      favoriteItems: [],
    };
    const route = `/${buildPatchMember(id)}`;
    const mutation = mutations.useAddFavoriteItem;

    it(`Successfully add favorite item`, async () => {
      const response = MEMBER_RESPONSE.set(
        'extra',
        convertJs({ favoriteItems: ['item-id'] }),
      );
      // set random data in cache
      queryClient.setQueryData(CURRENT_MEMBER_KEY, MEMBER_RESPONSE);
      const endpoints = [
        {
          response,
          method: HttpMethod.PATCH,
          route,
        },
      ];
      const mockedMutation = await mockMutation({
        mutation,
        wrapper,
        endpoints,
      });

      await act(async () => {
        await mockedMutation.mutate({ memberId: id, itemId, extra });
        await waitForMutation();
      });

      expect(
        queryClient.getQueryState(CURRENT_MEMBER_KEY)?.isInvalidated,
      ).toBeTruthy();
      expect(mockedNotifier).toHaveBeenCalledWith({
        type: addFavoriteItemRoutine.SUCCESS,
      });

      // verify cache keys
      const newData = queryClient.getQueryData(
        CURRENT_MEMBER_KEY,
      ) as MemberRecord;
      expect(newData).toEqualImmutable(response);
    });

    it(`Adding duplicated favorite item should dedupe`, async () => {
      const response = MEMBER_RESPONSE.set(
        'extra',
        convertJs({ favoriteItems: ['item-id'] }),
      );
      // set random data in cache
      queryClient.setQueryData(CURRENT_MEMBER_KEY, response);
      const endpoints = [
        {
          response,
          method: HttpMethod.PATCH,
          route,
        },
      ];
      const mockedMutation = await mockMutation({
        mutation,
        wrapper,
        endpoints,
      });

      await act(async () => {
        await mockedMutation.mutate({
          memberId: id,
          itemId,
          extra: { favoriteItems: ['item-id'] },
        });
        await waitForMutation();
      });

      expect(
        queryClient.getQueryState(CURRENT_MEMBER_KEY)?.isInvalidated,
      ).toBeTruthy();
      expect(mockedNotifier).toHaveBeenCalledWith({
        type: addFavoriteItemRoutine.SUCCESS,
      });

      // verify cache keys
      const newData = queryClient.getQueryData(
        CURRENT_MEMBER_KEY,
      ) as MemberRecord;
      expect(newData).toEqualImmutable(response);
    });

    it(`Unauthorized`, async () => {
      // set random data in cache
      queryClient.setQueryData(CURRENT_MEMBER_KEY, MEMBER_RESPONSE);
      const endpoints = [
        {
          response: UNAUTHORIZED_RESPONSE,
          statusCode: StatusCodes.UNAUTHORIZED,
          method: HttpMethod.PATCH,
          route,
        },
      ];
      const mockedMutation = await mockMutation({
        mutation,
        wrapper,
        endpoints,
      });

      await act(async () => {
        await mockedMutation.mutate({ memberId: id, itemId, extra });
        await waitForMutation();
      });

      // verify cache keys
      const oldData = queryClient.getQueryData(
        CURRENT_MEMBER_KEY,
      ) as MemberRecord;
      expect(oldData).toEqualImmutable(MEMBER_RESPONSE);
    });
  });

  describe('useDeleteFavoriteItem', () => {
    const id = 'member-id';
    const route = `/${buildPatchMember(id)}`;
    const itemId = 'item-id';
    const extra = {
      favoriteItems: ['item-id', 'item-id2'],
    };
    const mutation = mutations.useDeleteFavoriteItem;

    it(`Successfully delete favorite item`, async () => {
      const response = MEMBER_RESPONSE.set(
        'extra',
        convertJs({ favoriteItems: ['item-id2'] }),
      );
      // set random data in cache
      queryClient.setQueryData(CURRENT_MEMBER_KEY, MEMBER_RESPONSE);
      const endpoints = [
        {
          response,
          method: HttpMethod.PATCH,
          route,
        },
      ];
      const mockedMutation = await mockMutation({
        mutation,
        wrapper,
        endpoints,
      });

      await act(async () => {
        await mockedMutation.mutate({ memberId: id, itemId, extra });
        await waitForMutation();
      });

      // verify cache keys
      const newData = queryClient.getQueryData(
        CURRENT_MEMBER_KEY,
      ) as MemberRecord;
      expect(newData).toEqualImmutable(response);
    });

    it(`Unauthorized`, async () => {
      // set random data in cache
      queryClient.setQueryData(CURRENT_MEMBER_KEY, MEMBER_RESPONSE);
      const endpoints = [
        {
          response: UNAUTHORIZED_RESPONSE,
          statusCode: StatusCodes.UNAUTHORIZED,
          method: HttpMethod.PATCH,
          route,
        },
      ];
      const mockedMutation = await mockMutation({
        mutation,
        wrapper,
        endpoints,
      });

      await act(async () => {
        await mockedMutation.mutate({ memberId: id, itemId, extra });
        await waitForMutation();
      });

      // verify cache keys
      const oldData = queryClient.getQueryData(
        CURRENT_MEMBER_KEY,
      ) as MemberRecord;
      expect(oldData).toEqualImmutable(MEMBER_RESPONSE);
    });
  });
});

/* eslint-disable import/no-extraneous-dependencies */
import { act } from '@testing-library/react-hooks';
import { StatusCodes } from 'http-status-codes';
import { List, Record } from 'immutable';
import Cookies from 'js-cookie';
import nock from 'nock';

import { HttpMethod } from '@graasp/sdk';
import { SUCCESS_MESSAGES } from '@graasp/translations';

import {
  AVATAR_BLOB_RESPONSE,
  MEMBER_RESPONSE,
  OK_RESPONSE,
  UNAUTHORIZED_RESPONSE,
} from '../../test/constants';
import {
  buildTitleFromMutationKey,
  mockMutation,
  setUpTest,
  waitForMutation,
} from '../../test/utils';
import {
  SIGN_OUT_ROUTE,
  buildDeleteMemberRoute,
  buildPatchMember,
  buildUploadAvatarRoute,
} from '../api/routes';
import { THUMBNAIL_SIZES } from '../config/constants';
import {
  CURRENT_MEMBER_KEY,
  MUTATION_KEYS,
  buildAvatarKey,
} from '../config/keys';
import { addFavoriteItemRoutine, uploadAvatarRoutine } from '../routines';
import { MemberRecord } from '../types';

jest.spyOn(Cookies, 'get').mockReturnValue({ session: 'somesession' });

const mockedNotifier = jest.fn();
const { wrapper, queryClient, useMutation } = setUpTest({
  notifier: mockedNotifier,
});
describe('Member Mutations', () => {
  afterEach(() => {
    queryClient.clear();
    nock.cleanAll();
  });

  describe(buildTitleFromMutationKey(MUTATION_KEYS.SIGN_OUT), () => {
    const route = `/${SIGN_OUT_ROUTE}`;
    const mutation = () => useMutation(MUTATION_KEYS.SIGN_OUT);

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

  describe(buildTitleFromMutationKey(MUTATION_KEYS.DELETE_MEMBER), () => {
    const memberId = 'member-id';

    const mutation = () => useMutation(MUTATION_KEYS.DELETE_MEMBER);

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

  describe(buildTitleFromMutationKey(MUTATION_KEYS.EDIT_MEMBER), () => {
    const id = 'member-id';
    const route = `/${buildPatchMember(id)}`;
    const newMember = { name: 'newname' };
    const mutation = () => useMutation(MUTATION_KEYS.EDIT_MEMBER);

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
        await mockedMutation.mutate({ id, member: newMember });
        await waitForMutation();
      });

      // verify cache keys
      const oldData = queryClient.getQueryData(
        CURRENT_MEMBER_KEY,
      ) as MemberRecord;
      expect(oldData).toEqualImmutable(MEMBER_RESPONSE);
    });
  });

  describe(buildTitleFromMutationKey(MUTATION_KEYS.UPLOAD_AVATAR), () => {
    const mutation = () => useMutation(MUTATION_KEYS.UPLOAD_AVATAR);
    const member = MEMBER_RESPONSE;
    const { id } = member;

    it('Upload avatar', async () => {
      const route = `/${buildUploadAvatarRoute(id)}`;

      // set data in cache
      Object.values(THUMBNAIL_SIZES).forEach((size) => {
        const key = buildAvatarKey({ id, size });
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
        await mockedMutation.mutate({ id, data: [id] });
        await waitForMutation();
      });

      // verify member is still available
      // in real cases, the path should be different
      for (const size of Object.values(THUMBNAIL_SIZES)) {
        const key = buildAvatarKey({ id, size });
        const state = queryClient.getQueryState(key);
        expect(state?.isInvalidated).toBeTruthy();
      }
      expect(mockedNotifier).toHaveBeenCalledWith({
        type: uploadAvatarRoutine.SUCCESS,
        payload: { message: SUCCESS_MESSAGES.UPLOAD_AVATAR },
      });
    });

    it('Unauthorized to upload an avatar', async () => {
      const route = `/${buildUploadAvatarRoute(id)}`;
      // set data in cache
      Object.values(THUMBNAIL_SIZES).forEach((size) => {
        const key = buildAvatarKey({ id, size });
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
      for (const size of Object.values(THUMBNAIL_SIZES)) {
        const key = buildAvatarKey({ id, size });
        const state = queryClient.getQueryState(key);
        expect(state?.isInvalidated).toBeTruthy();
      }
      expect(mockedNotifier).toHaveBeenCalledWith({
        type: uploadAvatarRoutine.FAILURE,
        payload: { error: StatusCodes.UNAUTHORIZED },
      });
    });
  });

  describe(buildTitleFromMutationKey(MUTATION_KEYS.ADD_FAVORITE_ITEM), () => {
    const id = 'member-id';
    const itemId = 'item-id';
    const extra = {
      favoriteItems: [],
    };
    const route = `/${buildPatchMember(id)}`;
    const mutation = () => useMutation(MUTATION_KEYS.ADD_FAVORITE_ITEM);

    it(`Successfully add favorite item`, async () => {
      const createMemberExtra = Record({ favoriteItems: List(['item-id']) });
      const response = MEMBER_RESPONSE.set('extra', createMemberExtra() as any);
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

  describe(
    buildTitleFromMutationKey(MUTATION_KEYS.DELETE_FAVORITE_ITEM),
    () => {
      const id = 'member-id';
      const route = `/${buildPatchMember(id)}`;
      const itemId = 'item-id';
      const extra = {
        favoriteItems: ['item-id', 'item-id2'],
      };
      const mutation = () => useMutation(MUTATION_KEYS.DELETE_FAVORITE_ITEM);

      it(`Successfully delete favorite item`, async () => {
        const createMemberExtra = Record({ favoriteItems: List(['item-id2']) });
        const response = MEMBER_RESPONSE.set(
          'extra',
          createMemberExtra() as any,
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
    },
  );
});

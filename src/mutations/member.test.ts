import {
  CompleteMember,
  HttpMethod,
  MemberFactory,
  ThumbnailSize,
} from '@graasp/sdk';
import { SUCCESS_MESSAGES } from '@graasp/translations';

import { act } from '@testing-library/react';
import axios from 'axios';
import { StatusCodes } from 'http-status-codes';
import nock from 'nock';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  AVATAR_BLOB_RESPONSE,
  OK_RESPONSE,
  UNAUTHORIZED_RESPONSE,
} from '../../test/constants.js';
import { mockMutation, setUpTest, waitForMutation } from '../../test/utils.js';
import {
  SIGN_OUT_ROUTE,
  buildDeleteMemberRoute,
  buildPatchMember,
  buildUpdateMemberPasswordRoute,
  buildUploadAvatarRoute,
} from '../api/routes.js';
import { memberKeys } from '../config/keys.js';
import {
  updatePasswordRoutine,
  uploadAvatarRoutine,
} from '../routines/member.js';

const mockedNotifier = vi.fn();
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
      queryClient.setQueryData(memberKeys.current().content, MemberFactory());

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        mockedMutation.mutate(undefined);
        await waitForMutation();
      });

      // verify cache keys
      expect(queryClient.getQueryData(memberKeys.current().content)).toEqual(
        undefined,
      );
    });

    it(`Unauthorized`, async () => {
      // set random data in cache
      const member = MemberFactory();
      queryClient.setQueryData(memberKeys.current().content, member);
      const endpoints = [
        {
          method: HttpMethod.Get,
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
        mockedMutation.mutate(undefined);
        await waitForMutation();
      });

      // verify cache keys
      expect(
        queryClient.getQueryData(memberKeys.current().content),
      ).toMatchObject(member);
    });
  });

  describe('useDeleteMember', () => {
    const memberId = 'member-id';

    const mutation = mutations.useDeleteMember;

    it(`Successfully delete member`, async () => {
      const endpoints = [
        {
          route: `/${buildDeleteMemberRoute(memberId)}`,
          method: HttpMethod.Delete,
          response: OK_RESPONSE,
        },
        {
          route: `/${SIGN_OUT_ROUTE}`,
          response: OK_RESPONSE,
        },
      ];
      // set random data in cache
      queryClient.setQueryData(memberKeys.current().content, MemberFactory());

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        mockedMutation.mutate({ id: memberId });
        await waitForMutation(2000);
      });

      // verify cache keys
      expect(queryClient.getQueryData(memberKeys.current().content)).toEqual(
        undefined,
      );
    });

    it(`Unauthorized`, async () => {
      // set random data in cache
      const member = MemberFactory();
      queryClient.setQueryData(memberKeys.current().content, member);
      const endpoints = [
        {
          method: HttpMethod.Get,
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
        mockedMutation.mutate({ id: memberId });
        await waitForMutation();
      });

      // verify cache keys
      expect(
        queryClient.getQueryData(memberKeys.current().content),
      ).toMatchObject(member);
    });
  });

  describe('useEditMember', () => {
    const member = MemberFactory();
    const route = `/${buildPatchMember(member.id)}`;
    const newMember = { name: 'newname' };
    const mutation = mutations.useEditMember;

    it(`Successfully edit member id = ${member.id}`, async () => {
      const response = { ...member, name: newMember.name };
      // set random data in cache
      queryClient.setQueryData(memberKeys.current().content, member);
      const endpoints = [
        {
          response,
          method: HttpMethod.Patch,
          route,
        },
      ];
      const patchSpy = vi.spyOn(axios, 'patch');
      const mockedMutation = await mockMutation({
        mutation,
        wrapper,
        endpoints,
      });

      await act(async () => {
        mockedMutation.mutate({ id: member.id, ...newMember });
        await waitForMutation();
      });

      expect(patchSpy).toHaveBeenCalledWith(
        expect.stringContaining(member.id),
        newMember,
      );

      // verify cache keys
      const newData = queryClient.getQueryData<CompleteMember>(
        memberKeys.current().content,
      );
      expect(newData).toMatchObject(response);
    });

    it(`Unauthorized`, async () => {
      // set random data in cache
      queryClient.setQueryData(memberKeys.current().content, member);
      const endpoints = [
        {
          response: UNAUTHORIZED_RESPONSE,
          statusCode: StatusCodes.UNAUTHORIZED,
          method: HttpMethod.Patch,
          route,
        },
      ];
      const mockedMutation = await mockMutation({
        mutation,
        wrapper,
        endpoints,
      });

      await act(async () => {
        mockedMutation.mutate({ id: member.id, ...newMember });
        await waitForMutation();
      });

      // verify cache keys
      const oldData = queryClient.getQueryData<CompleteMember>(
        memberKeys.current().content,
      );
      expect(oldData).toMatchObject(member);
    });
  });

  describe('useUploadAvatar', () => {
    const mutation = mutations.useUploadAvatar;
    const member = MemberFactory();
    const replyUrl = true;
    const { id } = member;

    it('Upload avatar', async () => {
      const route = `/${buildUploadAvatarRoute()}`;

      // set data in cache
      Object.values(ThumbnailSize).forEach((size) => {
        const key = memberKeys.single(id).avatar({ size, replyUrl });
        queryClient.setQueryData(key, Math.random());
      });

      const response = AVATAR_BLOB_RESPONSE;

      const endpoints = [
        {
          response,
          method: HttpMethod.Post,
          route,
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        mockedMutation.mutate({ id, data: {} });
        await waitForMutation();
      });

      // verify member is still available
      // in real cases, the path should be different
      for (const size of Object.values(ThumbnailSize)) {
        const key = memberKeys.single(id).avatar({ size, replyUrl });
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
        const key = memberKeys.single(id).avatar({ size, replyUrl });
        queryClient.setQueryData(key, Math.random());
      });

      const response = UNAUTHORIZED_RESPONSE;

      const endpoints = [
        {
          response,
          statusCode: StatusCodes.UNAUTHORIZED,
          method: HttpMethod.Post,
          route,
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        mockedMutation.mutate({ id, error: StatusCodes.UNAUTHORIZED });
        await waitForMutation();
      });

      // verify member is still available
      // in real cases, the path should be different
      for (const size of Object.values(ThumbnailSize)) {
        const key = memberKeys.single(id).avatar({ size, replyUrl });
        const state = queryClient.getQueryState(key);
        expect(state?.isInvalidated).toBeTruthy();
      }
      expect(mockedNotifier).toHaveBeenCalledWith({
        type: uploadAvatarRoutine.FAILURE,
        payload: { error: StatusCodes.UNAUTHORIZED },
      });
    });
  });

  describe('useUpdatePassword', () => {
    const route = `/${buildUpdateMemberPasswordRoute()}`;
    const mutation = mutations.useUpdatePassword;
    const password = 'ASDasd123';
    const currentPassword = 'ASDasd123';
    const name = 'myName';
    const id = 'myId';
    const email = 'myemail@email.com';

    it(`Update password`, async () => {
      const endpoints = [
        {
          route,
          response: { email, id, name },
          statusCode: StatusCodes.OK,
          method: HttpMethod.Patch,
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        mockedMutation.mutate({ currentPassword, password });
        await waitForMutation();
      });

      expect(mockedNotifier).toHaveBeenCalledWith({
        type: updatePasswordRoutine.SUCCESS,
        payload: { message: SUCCESS_MESSAGES.UPDATE_PASSWORD },
      });
    });

    it(`Unauthorized`, async () => {
      const endpoints = [
        {
          route,
          response: UNAUTHORIZED_RESPONSE,
          method: HttpMethod.Patch,
          statusCode: StatusCodes.UNAUTHORIZED,
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        mockedMutation.mutate({ password, currentPassword });
        await waitForMutation();
      });

      expect(mockedNotifier).toHaveBeenCalledWith(
        expect.objectContaining({
          type: updatePasswordRoutine.FAILURE,
        }),
      );
    });
  });
});

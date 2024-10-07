import {
  CompleteMember,
  HttpMethod,
  MemberFactory,
  ThumbnailSize,
} from '@graasp/sdk';
import { SUCCESS_MESSAGES } from '@graasp/translations';

import { act } from '@testing-library/react';
import axios from 'axios';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import nock from 'nock';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { OK_RESPONSE, UNAUTHORIZED_RESPONSE } from '../../test/constants.js';
import { mockMutation, setUpTest, waitForMutation } from '../../test/utils.js';
import { memberKeys } from '../keys.js';
import { SIGN_OUT_ROUTE } from '../routes.js';
import {
  buildDeleteCurrentMemberRoute,
  buildExportMemberDataRoute,
  buildPatchCurrentMemberRoute,
  buildPatchMemberPasswordRoute,
  buildPostMemberPasswordRoute,
  buildUploadAvatarRoute,
} from './routes.js';
import {
  exportMemberDataRoutine,
  updatePasswordRoutine,
  uploadAvatarRoutine,
} from './routines.js';

const mockedNotifier = vi.fn();
const { wrapper, queryClient, mutations } = setUpTest({
  notifier: mockedNotifier,
});
describe('Member Mutations', () => {
  afterEach(() => {
    queryClient.clear();
    nock.cleanAll();
  });

  describe('useDeleteCurrentMember', () => {
    const mutation = mutations.useDeleteCurrentMember;

    it(`Successfully delete member`, async () => {
      const endpoints = [
        {
          route: `/${buildDeleteCurrentMemberRoute()}`,
          method: HttpMethod.Delete,
          response: OK_RESPONSE,
        },
        {
          route: SIGN_OUT_ROUTE,
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
        mockedMutation.mutate();
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
          route: `/${buildDeleteCurrentMemberRoute()}`,
        },
      ];
      const mockedMutation = await mockMutation({
        mutation,
        endpoints,
        wrapper,
      });

      await act(async () => {
        mockedMutation.mutate();
        await waitForMutation();
      });

      // verify cache keys
      expect(
        queryClient.getQueryData(memberKeys.current().content),
      ).toMatchObject(member);
    });
  });

  describe('useEditCurrentMember', () => {
    const member = MemberFactory();
    const route = `/${buildPatchCurrentMemberRoute()}`;
    const newMember = { name: 'newname' };
    const mutation = mutations.useEditCurrentMember;

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
        mockedMutation.mutate(newMember);
        await waitForMutation();
      });

      expect(patchSpy).toHaveBeenCalledWith(expect.anything(), newMember);

      // verify cache keys
      const newData = queryClient.getQueryData<CompleteMember>(
        memberKeys.current().content,
      );
      expect(newData).toMatchObject(response);
    });

    it(`Successfully edit member's username and ensures trimming`, async () => {
      const newUsernameWithTrailingSpace = 'newname  ';
      const trimmedUsername = newUsernameWithTrailingSpace.trim();
      const response = { ...member, name: trimmedUsername };
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
        mockedMutation.mutate({
          name: newUsernameWithTrailingSpace,
        });
        await waitForMutation();
      });
      const payload = patchSpy.mock.calls[0][1] as { name?: string };

      // Assert that the name sent to the API is trimmed
      expect(payload.name).toEqual(trimmedUsername);

      // verify cache keys
      const newData = queryClient.getQueryData<CompleteMember>(
        memberKeys.current().content,
      );
      expect(newData).toMatchObject(response);
    });

    it(`Successfully enable saveActions`, async () => {
      const enableSaveActions = true;
      const updateMember = { enableSaveActions };
      const response = { ...member, ...updateMember };
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
        mockedMutation.mutate(updateMember);
        await waitForMutation();
      });

      expect(patchSpy).toHaveBeenCalledWith(expect.anything(), updateMember);

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
        mockedMutation.mutate(newMember);
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
    const file = new Blob();

    it('Upload avatar', async () => {
      const route = `/${buildUploadAvatarRoute()}`;

      // set data in cache for current member (necessary for query invalidation)
      queryClient.setQueryData(memberKeys.current().content, member);
      // set query in cache for thumbnail from currentMember
      Object.values(ThumbnailSize).forEach((size) => {
        const key = memberKeys.single(id).avatar({ size, replyUrl });
        queryClient.setQueryData(key, 'thumbnail');
      });

      const endpoints = [
        {
          statusCode: StatusCodes.NO_CONTENT,
          method: HttpMethod.Post,
          route,
          response: {},
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        mockedMutation.mutate({ file });
        await waitForMutation();
      });

      for (const size of Object.values(ThumbnailSize)) {
        const key = memberKeys.single(id).avatar({ size, replyUrl: true });
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
      // set data in cache for current member (necessary for query invalidation)
      queryClient.setQueryData(memberKeys.current().content, member);
      Object.values(ThumbnailSize).forEach((size) => {
        const key = memberKeys.single(id).avatar({ size, replyUrl });
        queryClient.setQueryData(key, 'thumbnail');
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
        mockedMutation.mutate({ file });
        await waitForMutation();
      });

      for (const size of Object.values(ThumbnailSize)) {
        const key = memberKeys.single(id).avatar({ size, replyUrl });
        const state = queryClient.getQueryState(key);
        expect(state?.isInvalidated).toBeFalsy();
      }

      expect(mockedNotifier).toHaveBeenCalledWith(
        expect.objectContaining({ type: uploadAvatarRoutine.FAILURE }),
      );
    });
  });

  describe('useUpdatePassword', () => {
    const route = `/${buildPatchMemberPasswordRoute()}`;
    const mutation = mutations.useUpdatePassword;
    const password = 'ASDasd123';
    const currentPassword = 'ASDasd123';

    it(`Update password`, async () => {
      const endpoints = [
        {
          route,
          response: {},
          statusCode: StatusCodes.NO_CONTENT,
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

  describe('useCreatePassword', () => {
    const route = `/${buildPostMemberPasswordRoute()}`;
    const mutation = mutations.useCreatePassword;
    const password = 'ASDasd123';

    it(`Update password`, async () => {
      const endpoints = [
        {
          route,
          response: {},
          statusCode: StatusCodes.NO_CONTENT,
          method: HttpMethod.Post,
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        mockedMutation.mutate({ password });
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
          method: HttpMethod.Post,
          statusCode: StatusCodes.UNAUTHORIZED,
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        mockedMutation.mutate({ password });
        await waitForMutation();
      });

      expect(mockedNotifier).toHaveBeenCalledWith(
        expect.objectContaining({
          type: updatePasswordRoutine.FAILURE,
        }),
      );
    });
  });

  describe('useExportMemberData', () => {
    const mutation = mutations.useExportMemberData;
    const response = ReasonPhrases.OK;
    it('Export member data', async () => {
      const endpoints = [
        {
          response,
          route: `/${buildExportMemberDataRoute()}`,
          method: HttpMethod.Post,
        },
      ];
      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });
      await act(async () => {
        mockedMutation.mutate();
        await waitForMutation();
      });

      expect(mockedNotifier).toHaveBeenCalledWith({
        type: exportMemberDataRoutine.SUCCESS,
      });
    });
  });
});

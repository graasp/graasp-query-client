import { StatusCodes } from 'http-status-codes';
import { act } from '@testing-library/react-hooks';
import { Map, Record } from 'immutable';
import nock from 'nock';
import {
  buildPatchMember,
  buildUploadAvatarRoute,
  SIGN_OUT_ROUTE,
} from '../api/routes';
import { setUpTest, mockMutation, waitForMutation } from '../../test/utils';
import {
  AVATAR_BLOB_RESPONSE,
  MEMBER_RESPONSE,
  OK_RESPONSE,
  UNAUTHORIZED_RESPONSE,
} from '../../test/constants';
import {
  buildAvatarKey,
  CURRENT_MEMBER_KEY,
  MUTATION_KEYS,
} from '../config/keys';
import { Member } from '../types';
import { REQUEST_METHODS } from '../api/utils';
import { THUMBNAIL_SIZES } from '../config/constants';
import { uploadAvatarRoutine } from '../routines';

const mockedNotifier = jest.fn();
const { wrapper, queryClient, useMutation } = setUpTest({
  notifier: mockedNotifier,
});
describe('Member Mutations', () => {
  afterEach(() => {
    queryClient.clear();
    nock.cleanAll();
  });

  describe(MUTATION_KEYS.SIGN_OUT, () => {
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
          method: REQUEST_METHODS.GET,
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
      expect(queryClient.getQueryData(CURRENT_MEMBER_KEY)).toEqual(
        MEMBER_RESPONSE,
      );
    });
  });

  describe(MUTATION_KEYS.EDIT_MEMBER, () => {
    const id = 'member-id';
    const route = `/${buildPatchMember(id)}`;
    const newMember = { name: 'newname' };
    const mutation = () => useMutation(MUTATION_KEYS.EDIT_MEMBER);

    it(`Successfully edit member id = ${id}`, async () => {
      const response = { ...MEMBER_RESPONSE, ...newMember };
      // set random data in cache
      queryClient.setQueryData(CURRENT_MEMBER_KEY, Map(MEMBER_RESPONSE));
      const endpoints = [
        {
          response,
          method: REQUEST_METHODS.PATCH,
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
      ) as Record<Member>;
      expect(newData.toJS()).toEqual(response);
    });

    it(`Unauthorized`, async () => {
      // set random data in cache
      queryClient.setQueryData(CURRENT_MEMBER_KEY, Map(MEMBER_RESPONSE));
      const endpoints = [
        {
          response: UNAUTHORIZED_RESPONSE,
          statusCode: StatusCodes.UNAUTHORIZED,
          method: REQUEST_METHODS.PATCH,
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
      ) as Record<Member>;
      expect(oldData.toJS()).toEqual(MEMBER_RESPONSE);
    });
  });

  describe(MUTATION_KEYS.UPLOAD_AVATAR, () => {
    const mutation = () => useMutation(MUTATION_KEYS.UPLOAD_AVATAR);
    const member = MEMBER_RESPONSE;
    const id = member.id;

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
          method: REQUEST_METHODS.POST,
          route,
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        await mockedMutation.mutate({ id });
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
          method: REQUEST_METHODS.POST,
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
});

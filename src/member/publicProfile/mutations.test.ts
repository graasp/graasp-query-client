import { HttpMethod, MemberFactory, PublicProfile } from '@graasp/sdk';

import { act } from '@testing-library/react';
import nock from 'nock';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  mockMutation,
  setUpTest,
  waitForMutation,
} from '../../../test/utils.js';
import { memberKeys } from '../../keys.js';
import {
  buildPatchPublicProfileRoute,
  buildPostPublicProfileRoute,
} from '../routes.js';

const mockedNotifier = vi.fn();
const { wrapper, queryClient, mutations } = setUpTest({
  notifier: mockedNotifier,
});
const newProfile = {
  bio: 'text',
  twitterID: 'twitter_handle',
  facebookID: 'fb_handle',
  linkedinID: 'linkedin_handle',
  visibility: false,
};
describe('Public Profile Mutations', () => {
  afterEach(() => {
    queryClient.clear();
    nock.cleanAll();
    mockedNotifier.mockClear();
  });

  describe('usePostPublicProfile', () => {
    const mutation = mutations.usePostPublicProfile;

    it('Post profile', async () => {
      const route = `/${buildPostPublicProfileRoute()}`;
      const response: PublicProfile = {
        ...newProfile,
        id: 'someid',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      queryClient.setQueryData(memberKeys.current().profile, response);

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
        mockedMutation.mutate(newProfile);
        await waitForMutation();
      });

      expect(
        queryClient.getQueryState(memberKeys.current().profile)?.data,
      ).toEqual(response);
    });
  });

  describe('usePatchPublicProfile', () => {
    const mutation = mutations.usePatchPublicProfile;
    const payload = { bio: 'new description' };
    const result = {
      ...newProfile,
      bio: 'new description',
      id: 'someid',
      member: MemberFactory(),
    };

    it('Edit public profile', async () => {
      const route = `/${buildPatchPublicProfileRoute()}`;
      const response = null;
      const endpoints = [
        {
          response,
          method: HttpMethod.Patch,
          route,
        },
      ];
      queryClient.setQueryData(memberKeys.current().profile, result);

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        mockedMutation.mutate(payload);
        await waitForMutation();
      });

      expect(
        queryClient.getQueryState(memberKeys.current().profile)?.data,
      ).toEqual(result);
      expect(queryClient.getQueryData(memberKeys.current().profile)).toEqual(
        result,
      );
    });
  });
});

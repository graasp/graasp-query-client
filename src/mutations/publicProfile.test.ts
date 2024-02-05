import { HttpMethod, MemberFactory } from '@graasp/sdk';

import { act } from '@testing-library/react';
import nock from 'nock';

import { mockMutation, setUpTest, waitForMutation } from '../../test/utils';
import { MEMBERS_ROUTE, PUBLIC_PROFILE_ROUTE } from '../api/routes';
import { memberKeys } from '../config/keys';

const mockedNotifier = jest.fn();
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
      const route = `/${MEMBERS_ROUTE}/${PUBLIC_PROFILE_ROUTE}`;
      const response = { ...newProfile, id: 'someid', member: MemberFactory() };

      queryClient.setQueryData(memberKeys.current().profile, response);

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
        await mockedMutation.mutate(newProfile);
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
      const route = `/${MEMBERS_ROUTE}/${PUBLIC_PROFILE_ROUTE}`;
      const response = null;
      const endpoints = [
        {
          response,
          method: HttpMethod.PATCH,
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
        await mockedMutation.mutate(payload);
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

import { HttpMethod } from '@graasp/sdk';

import { act } from '@testing-library/react';
import nock from 'nock';

import { MEMBER_RESPONSE } from '../../test/constants';
import { mockMutation, setUpTest, waitForMutation } from '../../test/utils';
import { PUBLIC_PROFILE_ROUTE } from '../api/routes';
import { OWN_PUBLIC_PROFILE_KEY } from '../config/keys';

const mockedNotifier = jest.fn();
const { wrapper, queryClient, mutations } = setUpTest({
  notifier: mockedNotifier,
});
const newProfile = {
  bio: 'text',
  twitterLink: 'https://twitter.com/test',
  facebookLink: 'https://facebook.com/test',
  linkedinLink: 'https://linkedin.com/test',
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
      const route = `/${PUBLIC_PROFILE_ROUTE}`;
      const response = { ...newProfile, id: 'someid', member: MEMBER_RESPONSE };

      queryClient.setQueryData(OWN_PUBLIC_PROFILE_KEY, response);

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

      expect(queryClient.getQueryState(OWN_PUBLIC_PROFILE_KEY)?.data).toEqual(
        response,
      );
    });
  });

  describe('usePatchPublicProfile', () => {
    const mutation = mutations.usePatchPublicProfile;
    const payload = { bio: 'new description' };
    const result = {
      ...newProfile,
      bio: 'new description',
      id: 'someid',
      member: MEMBER_RESPONSE,
    };

    it('Edit public profile', async () => {
      const route = `/${PUBLIC_PROFILE_ROUTE}`;
      const response = null;
      const endpoints = [
        {
          response,
          method: HttpMethod.PATCH,
          route,
        },
      ];
      queryClient.setQueryData(OWN_PUBLIC_PROFILE_KEY, result);

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        await mockedMutation.mutate(payload);
        await waitForMutation();
      });

      expect(queryClient.getQueryState(OWN_PUBLIC_PROFILE_KEY)?.data).toEqual(
        result,
      );
      expect(queryClient.getQueryData(OWN_PUBLIC_PROFILE_KEY)).toEqual(result);
    });
  });
});

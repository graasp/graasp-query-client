/* eslint-disable import/no-extraneous-dependencies */
import { act } from '@testing-library/react-hooks';
import { StatusCodes } from 'http-status-codes';
import Cookies from 'js-cookie';
import nock from 'nock';

import { HttpMethod } from '@graasp/sdk';
import * as utils from '@graasp/sdk';
import { SUCCESS_MESSAGES } from '@graasp/translations';

import {
  DOMAIN,
  OK_RESPONSE,
  UNAUTHORIZED_RESPONSE,
} from '../../test/constants';
import { mockMutation, setUpTest, waitForMutation } from '../../test/utils';
import {
  SIGN_IN_ROUTE,
  SIGN_IN_WITH_PASSWORD_ROUTE,
  SIGN_OUT_ROUTE,
  SIGN_UP_ROUTE,
  buildUpdateMemberPasswordRoute,
} from '../api/routes';
import { CURRENT_MEMBER_KEY, MUTATION_KEYS } from '../config/keys';
import {
  signInRoutine,
  signInWithPasswordRoutine,
  signOutRoutine,
  signUpRoutine,
  switchMemberRoutine,
  updatePasswordRoutine,
} from '../routines';

jest.mock('@graasp/sdk', () => {
  // use auto-mocking system to get an object that mocks all
  // of the module's functions, just like what `jest.mock()`
  // (w/ no parameters) would do
  const allAutoMocked = jest.createMockFromModule('@graasp/sdk');

  // grab all the *real* implementations of the module's functions
  // in an object
  const actualModule = jest.requireActual('@graasp/sdk');
  return {
    __esModule: true,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    ...allAutoMocked,
    convertJs: actualModule.convertJs,
  };
});

jest.spyOn(Cookies, 'get').mockReturnValue({ session: 'somesession' });
jest.spyOn(utils, 'isUserAuthenticated').mockReturnValue(true);

const email = 'myemail@email.com';

describe('Authentication Mutations', () => {
  const mockedNotifier = jest.fn();
  const { wrapper, queryClient, useMutation } = setUpTest({
    notifier: mockedNotifier,
  });

  afterEach(() => {
    queryClient.clear();
    nock.cleanAll();
  });

  describe(MUTATION_KEYS.SIGN_IN, () => {
    const route = `/${SIGN_IN_ROUTE}`;
    const mutation = () => useMutation(MUTATION_KEYS.SIGN_IN);

    it(`Sign in`, async () => {
      const endpoints = [
        { route, response: OK_RESPONSE, method: HttpMethod.POST },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        await mockedMutation.mutate({ email });
        await waitForMutation();
      });

      expect(mockedNotifier).toHaveBeenCalledWith({
        type: signInRoutine.SUCCESS,
        payload: { message: SUCCESS_MESSAGES.SIGN_IN },
      });
    });

    it(`Unauthorized`, async () => {
      const endpoints = [
        {
          route,
          response: UNAUTHORIZED_RESPONSE,
          method: HttpMethod.POST,
          statusCode: StatusCodes.UNAUTHORIZED,
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        await mockedMutation.mutate({ email });
        await waitForMutation();
      });

      expect(mockedNotifier).toHaveBeenCalledWith(
        expect.objectContaining({
          type: signInRoutine.FAILURE,
        }),
      );
    });
  });

  describe(MUTATION_KEYS.SIGN_IN_WITH_PASSWORD, () => {
    const route = `/${SIGN_IN_WITH_PASSWORD_ROUTE}`;
    const mutation = () => useMutation(MUTATION_KEYS.SIGN_IN_WITH_PASSWORD);
    const password = 'password';
    const link = 'mylink';

    it(`Sign in with password`, async () => {
      const endpoints = [
        {
          route,
          response: { resource: link },
          statusCode: StatusCodes.SEE_OTHER,
          method: HttpMethod.POST,
        },
      ];
      // set random data in cache
      queryClient.setQueryData(CURRENT_MEMBER_KEY, 'somevalue');

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        await mockedMutation.mutate({ email, password });
        await waitForMutation();
      });

      // verify cache keys
      expect(queryClient.getQueryData(CURRENT_MEMBER_KEY)).toBeFalsy();

      expect(mockedNotifier).toHaveBeenCalledWith({
        type: signInWithPasswordRoutine.SUCCESS,
        payload: { message: SUCCESS_MESSAGES.SIGN_IN_WITH_PASSWORD },
      });
    });

    it(`Unauthorized`, async () => {
      const endpoints = [
        {
          route,
          response: UNAUTHORIZED_RESPONSE,
          method: HttpMethod.POST,
          statusCode: StatusCodes.UNAUTHORIZED,
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        await mockedMutation.mutate({ email });
        await waitForMutation();
      });

      expect(mockedNotifier).toHaveBeenCalledWith(
        expect.objectContaining({
          type: signInWithPasswordRoutine.FAILURE,
        }),
      );
    });
  });

  describe(MUTATION_KEYS.UPDATE_PASSWORD, () => {
    const route = `/${buildUpdateMemberPasswordRoute()}`;
    const mutation = () => useMutation(MUTATION_KEYS.UPDATE_PASSWORD);
    const password = 'ASDasd123';
    const currentPassword = 'ASDasd123';
    const name = 'myName';
    const id = 'myId';

    it(`Update password`, async () => {
      const endpoints = [
        {
          route,
          response: { email, id, name },
          statusCode: StatusCodes.OK,
          method: HttpMethod.PATCH,
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        await mockedMutation.mutate({ currentPassword, password });
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
          method: HttpMethod.PATCH,
          statusCode: StatusCodes.UNAUTHORIZED,
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        await mockedMutation.mutate({ password });
        await waitForMutation();
      });

      expect(mockedNotifier).toHaveBeenCalledWith(
        expect.objectContaining({
          type: updatePasswordRoutine.FAILURE,
        }),
      );
    });
  });

  describe(MUTATION_KEYS.SIGN_UP, () => {
    const route = `/${SIGN_UP_ROUTE}`;
    const mutation = () => useMutation(MUTATION_KEYS.SIGN_UP);
    const name = 'name';

    it(`Sign up`, async () => {
      const endpoints = [
        { route, response: OK_RESPONSE, method: HttpMethod.POST },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        await mockedMutation.mutate({ email, name });
        await waitForMutation();
      });

      expect(mockedNotifier).toHaveBeenCalledWith({
        type: signUpRoutine.SUCCESS,
        payload: { message: SUCCESS_MESSAGES.SIGN_UP },
      });
    });

    it(`Unauthorized`, async () => {
      const endpoints = [
        {
          route,
          response: UNAUTHORIZED_RESPONSE,
          method: HttpMethod.POST,
          statusCode: StatusCodes.UNAUTHORIZED,
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        await mockedMutation.mutate({ email, name });
        await waitForMutation();
      });

      expect(mockedNotifier).toHaveBeenCalledWith(
        expect.objectContaining({
          type: signUpRoutine.FAILURE,
        }),
      );
    });
  });

  describe(MUTATION_KEYS.SIGN_OUT, () => {
    const route = `/${SIGN_OUT_ROUTE}`;
    const mutation = () => useMutation(MUTATION_KEYS.SIGN_OUT);
    const userId = 'userId';

    it(`Sign out`, async () => {
      // set random data in cache
      queryClient.setQueryData(CURRENT_MEMBER_KEY, 'somevalue');

      const endpoints = [
        { route, response: OK_RESPONSE, method: HttpMethod.GET },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        await mockedMutation.mutate(userId);
        await waitForMutation();
      });

      expect(mockedNotifier).toHaveBeenCalledWith({
        type: signOutRoutine.SUCCESS,
        payload: { message: SUCCESS_MESSAGES.SIGN_OUT },
      });
      expect(queryClient.getQueryData(CURRENT_MEMBER_KEY)).toBeFalsy();

      // cookie management
      expect(utils.saveUrlForRedirection).toHaveBeenCalled();
      expect(utils.setCurrentSession).toHaveBeenCalledWith(null, DOMAIN);
      expect(utils.removeSession).toHaveBeenCalledWith(userId, DOMAIN);
    });

    it(`Unauthorized`, async () => {
      const endpoints = [
        {
          route,
          response: UNAUTHORIZED_RESPONSE,
          method: HttpMethod.GET,
          statusCode: StatusCodes.UNAUTHORIZED,
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        await mockedMutation.mutate({});
        await waitForMutation();
      });

      expect(mockedNotifier).toHaveBeenCalledWith(
        expect.objectContaining({
          type: signOutRoutine.FAILURE,
        }),
      );
    });
  });

  describe(MUTATION_KEYS.SWITCH_MEMBER, () => {
    const mutation = () => useMutation(MUTATION_KEYS.SWITCH_MEMBER);
    const MOCK_SESSIONS = [{ id: 'id1', token: 'token1' }];

    it(`Switch Member`, async () => {
      const mockedMutation = await mockMutation({
        mutation,
        wrapper,
      });

      (utils.getStoredSessions as jest.Mock).mockReturnValue(MOCK_SESSIONS);

      await act(async () => {
        await mockedMutation.mutate({
          memberId: MOCK_SESSIONS[0].id,
          domain: DOMAIN,
        });
        await waitForMutation();
      });

      expect(queryClient.getQueryData(CURRENT_MEMBER_KEY)).toBeFalsy();

      expect(mockedNotifier).toHaveBeenCalledWith({
        type: switchMemberRoutine.SUCCESS,
      });

      // cookie management
      expect(utils.getStoredSessions).toHaveBeenCalled();
      expect(utils.setCurrentSession).toHaveBeenCalledWith(
        MOCK_SESSIONS[0].token,
        DOMAIN,
      );
    });
    it(`Throw if session does not exist`, async () => {
      const mockedMutation = await mockMutation({
        mutation,
        wrapper,
      });

      (utils.getStoredSessions as jest.Mock).mockReturnValue([]);

      await act(async () => {
        await mockedMutation.mutate({
          memberId: MOCK_SESSIONS[0].id,
          domain: DOMAIN,
        });
        await waitForMutation();
      });

      expect(queryClient.getQueryData(CURRENT_MEMBER_KEY)).toBeFalsy();

      expect(mockedNotifier).toHaveBeenCalledWith({
        type: switchMemberRoutine.FAILURE,
        payload: expect.anything(),
      });
    });
  });
});

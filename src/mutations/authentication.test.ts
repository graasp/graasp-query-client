/* eslint-disable import/no-extraneous-dependencies */
import { act } from '@testing-library/react-hooks';
import nock from 'nock';
import Cookies from 'js-cookie';
import * as utils from '@graasp/utils';
import { SUCCESS_MESSAGES } from '@graasp/translations';
import { StatusCodes } from 'http-status-codes';
import {
  SIGN_IN_ROUTE,
  SIGN_IN_WITH_PASSWORD_ROUTE,
  SIGN_OUT_ROUTE,
  SIGN_UP_ROUTE,
} from '../api/routes';
import { setUpTest, mockMutation, waitForMutation } from '../../test/utils';
import {
  DOMAIN,
  OK_RESPONSE,
  UNAUTHORIZED_RESPONSE,
} from '../../test/constants';
import { CURRENT_MEMBER_KEY, MUTATION_KEYS } from '../config/keys';
import { REQUEST_METHODS } from '../api/utils';
import {
  signInRoutine,
  signInWithPasswordRoutine,
  signOutRoutine,
  signUpRoutine,
  switchMemberRoutine,
} from '../routines';

jest.mock('@graasp/utils');

jest.spyOn(Cookies, 'get').mockReturnValue({ session: 'somesession' });

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
        { route, response: OK_RESPONSE, method: REQUEST_METHODS.POST },
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
          method: REQUEST_METHODS.POST,
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
          method: REQUEST_METHODS.POST,
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
          method: REQUEST_METHODS.POST,
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

  describe(MUTATION_KEYS.SIGN_UP, () => {
    const route = `/${SIGN_UP_ROUTE}`;
    const mutation = () => useMutation(MUTATION_KEYS.SIGN_UP);
    const name = 'name';

    it(`Sign up`, async () => {
      const endpoints = [
        { route, response: OK_RESPONSE, method: REQUEST_METHODS.POST },
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
          method: REQUEST_METHODS.POST,
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
        { route, response: OK_RESPONSE, method: REQUEST_METHODS.GET },
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

      expect(queryClient.getQueryData(CURRENT_MEMBER_KEY)).toBeFalsy();

      expect(mockedNotifier).toHaveBeenCalledWith({
        type: signOutRoutine.SUCCESS,
        payload: { message: SUCCESS_MESSAGES.SIGN_OUT },
      });

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
          method: REQUEST_METHODS.GET,
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

/* eslint-disable import/no-extraneous-dependencies */
import { HttpMethod } from '@graasp/sdk';
import * as utils from '@graasp/sdk';
import { SUCCESS_MESSAGES } from '@graasp/translations';

import { act } from '@testing-library/react-hooks';
import { StatusCodes } from 'http-status-codes';
import Cookies from 'js-cookie';
import nock from 'nock';

import { OK_RESPONSE, UNAUTHORIZED_RESPONSE } from '../../test/constants';
import { mockMutation, setUpTest, waitForMutation } from '../../test/utils';
import {
  MOBILE_SIGN_IN_ROUTE,
  MOBILE_SIGN_IN_WITH_PASSWORD_ROUTE,
  MOBILE_SIGN_UP_ROUTE,
  SIGN_IN_ROUTE,
  SIGN_IN_WITH_PASSWORD_ROUTE,
  SIGN_OUT_ROUTE,
  SIGN_UP_ROUTE,
  buildUpdateMemberPasswordRoute,
} from '../api/routes';
import { CURRENT_MEMBER_KEY } from '../config/keys';
import {
  signInRoutine,
  signInWithPasswordRoutine,
  signOutRoutine,
  signUpRoutine,
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

const captcha = 'captcha';
const email = 'myemail@email.com';
const challenge = '1234';

describe('Authentication Mutations', () => {
  const mockedNotifier = jest.fn();
  const { wrapper, queryClient, mutations } = setUpTest({
    notifier: mockedNotifier,
  });

  afterEach(() => {
    queryClient.clear();
    nock.cleanAll();
    jest.clearAllMocks();
  });

  describe('useSignIn', () => {
    const route = `/${SIGN_IN_ROUTE}`;
    const mutation = mutations.useSignIn;

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
        await mockedMutation.mutate({ email, captcha });
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
        await mockedMutation.mutate({ email, captcha });
        await waitForMutation();
      });

      expect(mockedNotifier).toHaveBeenCalledWith(
        expect.objectContaining({
          type: signInRoutine.FAILURE,
        }),
      );
    });
  });

  describe('useMobileSignIn', () => {
    const route = `/${MOBILE_SIGN_IN_ROUTE}`;
    const mutation = mutations.useMobileSignIn;

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
        await mockedMutation.mutate({ email, captcha, challenge });
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
        await mockedMutation.mutate({ email, captcha, challenge });
        await waitForMutation();
      });

      expect(mockedNotifier).toHaveBeenCalledWith(
        expect.objectContaining({
          type: signInRoutine.FAILURE,
        }),
      );
    });
  });

  describe('useSignInWithPassword', () => {
    const route = `/${SIGN_IN_WITH_PASSWORD_ROUTE}`;
    const mutation = mutations.useSignInWithPassword;
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
        await mockedMutation.mutate({ email, password, captcha });
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
        await mockedMutation.mutate({ email, password, captcha });
        await waitForMutation();
      });

      expect(mockedNotifier).toHaveBeenCalledWith(
        expect.objectContaining({
          type: signInWithPasswordRoutine.FAILURE,
        }),
      );
    });
  });

  describe('useMobileSignInWithPassword', () => {
    const route = `/${MOBILE_SIGN_IN_WITH_PASSWORD_ROUTE}`;
    const mutation = mutations.useMobileSignInWithPassword;
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
        await mockedMutation.mutate({ email, password, captcha, challenge });
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
        await mockedMutation.mutate({ email, password, captcha, challenge });
        await waitForMutation();
      });

      expect(mockedNotifier).toHaveBeenCalledWith(
        expect.objectContaining({
          type: signInWithPasswordRoutine.FAILURE,
        }),
      );
    });
  });

  describe('useUpdatePassword', () => {
    const route = `/${buildUpdateMemberPasswordRoute()}`;
    const mutation = mutations.useUpdatePassword;
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
        await mockedMutation.mutate({ password, currentPassword });
        await waitForMutation();
      });

      expect(mockedNotifier).toHaveBeenCalledWith(
        expect.objectContaining({
          type: updatePasswordRoutine.FAILURE,
        }),
      );
    });
  });

  describe('useSignUp', () => {
    const route = `/${SIGN_UP_ROUTE}`;
    const mutation = mutations.useSignUp;
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
        await mockedMutation.mutate({ email, name, captcha });
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
        await mockedMutation.mutate({ email, name, captcha });
        await waitForMutation();
      });

      expect(mockedNotifier).toHaveBeenCalledWith(
        expect.objectContaining({
          type: signUpRoutine.FAILURE,
        }),
      );
    });
  });
  describe('useMobileSignUp', () => {
    const route = `/${MOBILE_SIGN_UP_ROUTE}`;
    const mutation = mutations.useMobileSignUp;
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
        await mockedMutation.mutate({ email, name, captcha, challenge });
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
        await mockedMutation.mutate({ email, name, captcha, challenge });
        await waitForMutation();
      });

      expect(mockedNotifier).toHaveBeenCalledWith(
        expect.objectContaining({
          type: signUpRoutine.FAILURE,
        }),
      );
    });
  });

  describe('useSignOut', () => {
    const route = `/${SIGN_OUT_ROUTE}`;
    const mutation = mutations.useSignOut;
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
        await mockedMutation.mutate(undefined);
        await waitForMutation();
      });

      expect(mockedNotifier).toHaveBeenCalledWith(
        expect.objectContaining({
          type: signOutRoutine.FAILURE,
        }),
      );
    });
  });

  // describe('useSwitchMember', () => {
  //   const mutation = mutations.useSwitchMember;
  //   const MOCK_SESSIONS = [{ id: 'id1', token: 'token1' }];

  //   it(`Switch Member`, async () => {
  //     const mockedMutation = await mockMutation({
  //       mutation,
  //       wrapper,
  //     });

  //     (utils.getStoredSessions as jest.Mock).mockReturnValue(MOCK_SESSIONS);

  //     await act(async () => {
  //       await mockedMutation.mutate({
  //         memberId: MOCK_SESSIONS[0].id,
  //         domain: DOMAIN,
  //       });
  //       await waitForMutation();
  //     });

  //     expect(queryClient.getQueryData(CURRENT_MEMBER_KEY)).toBeFalsy();

  //     expect(mockedNotifier).toHaveBeenCalledWith({
  //       type: switchMemberRoutine.SUCCESS,
  //     });

  //     // cookie management
  //     expect(utils.getStoredSessions).toHaveBeenCalled();
  //     expect(utils.setCurrentSession).toHaveBeenCalledWith(
  //       MOCK_SESSIONS[0].token,
  //       DOMAIN,
  //     );
  //   });
  //   it(`Throw if session does not exist`, async () => {
  //     const mockedMutation = await mockMutation({
  //       mutation,
  //       wrapper,
  //     });

  //     (utils.getStoredSessions as jest.Mock).mockReturnValue([]);

  //     await act(async () => {
  //       await mockedMutation.mutate({
  //         memberId: MOCK_SESSIONS[0].id,
  //         domain: DOMAIN,
  //       });
  //       await waitForMutation();
  //     });

  //     expect(queryClient.getQueryData(CURRENT_MEMBER_KEY)).toBeFalsy();

  //     expect(mockedNotifier).toHaveBeenCalledWith({
  //       type: switchMemberRoutine.FAILURE,
  //       payload: expect.anything(),
  //     });
  //   });
  // });
});

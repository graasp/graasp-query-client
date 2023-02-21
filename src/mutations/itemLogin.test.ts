/* eslint-disable import/no-extraneous-dependencies */
import { StatusCodes } from 'http-status-codes';
import Cookies from 'js-cookie';
import nock from 'nock';
import { act } from 'react-test-renderer';

import { HttpMethod, ItemLoginSchema } from '@graasp/sdk';
import { SUCCESS_MESSAGES } from '@graasp/translations';

import {
  ITEMS,
  ITEM_LOGIN_RESPONSE,
  MEMBER_RESPONSE,
} from '../../test/constants';
import { mockMutation, setUpTest, waitForMutation } from '../../test/utils';
import {
  buildPostItemLoginSignInRoute,
  buildPutItemLoginSchema,
} from '../api/routes';
import {
  CURRENT_MEMBER_KEY,
  OWN_ITEMS_KEY,
  buildItemLoginKey,
} from '../config/keys';
import { postItemLoginRoutine, putItemLoginRoutine } from '../routines';

const mockedNotifier = jest.fn();
const { wrapper, queryClient, mutations } = setUpTest({
  notifier: mockedNotifier,
});
jest.spyOn(Cookies, 'get').mockReturnValue({ session: 'somesession' });

describe('Item Login Mutations', () => {
  afterEach(() => {
    queryClient.clear();
    nock.cleanAll();
  });

  const { name: username, id: memberId } = MEMBER_RESPONSE;
  const password = 'password';
  const itemId = ITEMS.first()!.id;
  describe('usePostItemLogin', () => {
    const route = `/${buildPostItemLoginSignInRoute(itemId)}`;
    const mutation = mutations.usePostItemLogin;
    it('Post item login', async () => {
      queryClient.setQueryData(CURRENT_MEMBER_KEY, MEMBER_RESPONSE);
      queryClient.setQueryData(OWN_ITEMS_KEY, ITEMS);

      const endpoints = [
        {
          response: {},
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
        await mockedMutation.mutate({
          itemId,
          username,
          memberId,
          password,
        });
        await waitForMutation();
      });

      // check all set keys are reset
      expect(queryClient.getQueryData(CURRENT_MEMBER_KEY)).toBeFalsy();
      expect(queryClient.getQueryData(OWN_ITEMS_KEY)).toBeFalsy();
    });

    it('Unauthorized to post item login', async () => {
      queryClient.setQueryData(CURRENT_MEMBER_KEY, MEMBER_RESPONSE);
      queryClient.setQueryData(OWN_ITEMS_KEY, ITEMS);

      const endpoints = [
        {
          response: {},
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
        await mockedMutation.mutate({
          itemId,
          username,
          memberId,
          password,
        });
        await waitForMutation();
      });

      // check all set keys are reset
      expect(queryClient.getQueryData(CURRENT_MEMBER_KEY)).toBeFalsy();
      expect(queryClient.getQueryData(OWN_ITEMS_KEY)).toBeFalsy();

      expect(mockedNotifier).toHaveBeenCalledWith(
        expect.objectContaining({
          type: postItemLoginRoutine.FAILURE,
        }),
      );
    });
  });

  describe('usePutItemLogin', () => {
    const route = `/${buildPutItemLoginSchema(itemId)}`;
    const mutation = mutations.usePutItemLogin;
    const loginSchema = ITEM_LOGIN_RESPONSE;
    const itemLoginKey = buildItemLoginKey(itemId);
    const newLoginSchema = ItemLoginSchema.USERNAME_AND_PASSWORD;

    it('Put item login', async () => {
      queryClient.setQueryData(itemLoginKey, loginSchema);

      const endpoints = [
        {
          response: {},
          method: HttpMethod.PUT,
          route,
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        await mockedMutation.mutate({ itemId, loginSchema: newLoginSchema });
        await waitForMutation();
      });

      // check all set keys are reset
      expect(
        queryClient.getQueryState(itemLoginKey)?.isInvalidated,
      ).toBeTruthy();
      expect(mockedNotifier).toHaveBeenCalledWith({
        type: putItemLoginRoutine.SUCCESS,
        payload: { message: SUCCESS_MESSAGES.PUT_ITEM_LOGIN },
      });
    });

    it('Unauthorized to put item login', async () => {
      queryClient.setQueryData(itemLoginKey, loginSchema);

      const endpoints = [
        {
          response: {},
          statusCode: StatusCodes.UNAUTHORIZED,
          method: HttpMethod.PUT,
          route,
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        await mockedMutation.mutate({ itemId, loginSchema: newLoginSchema });
        await waitForMutation();
      });

      // check all set keys are reset
      expect(
        queryClient.getQueryState(itemLoginKey)?.isInvalidated,
      ).toBeTruthy();

      expect(mockedNotifier).toHaveBeenCalledWith(
        expect.objectContaining({
          type: putItemLoginRoutine.FAILURE,
        }),
      );
    });
  });
});

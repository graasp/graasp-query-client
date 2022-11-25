/* eslint-disable import/no-extraneous-dependencies */
import { StatusCodes } from 'http-status-codes';
import Cookies from 'js-cookie';
import nock from 'nock';
import { act } from 'react-test-renderer';

import { HttpMethod } from '@graasp/sdk';
import { SUCCESS_MESSAGES } from '@graasp/translations';

import {
  ITEMS,
  ITEM_LOGIN_RESPONSE,
  MEMBER_RESPONSE,
} from '../../test/constants';
import {
  buildTitleFromMutationKey,
  mockMutation,
  setUpTest,
  waitForMutation,
} from '../../test/utils';
import {
  buildPostItemLoginSignInRoute,
  buildPutItemLoginSchema,
} from '../api/routes';
import {
  CURRENT_MEMBER_KEY,
  MUTATION_KEYS,
  OWN_ITEMS_KEY,
  buildItemLoginKey,
} from '../config/keys';
import { postItemLoginRoutine, putItemLoginRoutine } from '../routines';
import { ITEM_LOGIN_SCHEMAS } from '../types';

const mockedNotifier = jest.fn();
const { wrapper, queryClient, useMutation } = setUpTest({
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
  describe(buildTitleFromMutationKey(MUTATION_KEYS.POST_ITEM_LOGIN), () => {
    const route = `/${buildPostItemLoginSignInRoute(itemId)}`;
    const mutation = () => useMutation(MUTATION_KEYS.POST_ITEM_LOGIN);
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

  describe(buildTitleFromMutationKey(MUTATION_KEYS.PUT_ITEM_LOGIN), () => {
    const route = `/${buildPutItemLoginSchema(itemId)}`;
    const mutation = () => useMutation(MUTATION_KEYS.PUT_ITEM_LOGIN);
    const loginSchema = ITEM_LOGIN_RESPONSE;
    const itemLoginKey = buildItemLoginKey(itemId);
    const newLoginSchema = ITEM_LOGIN_SCHEMAS.USERNAME_AND_PASSWORD;

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

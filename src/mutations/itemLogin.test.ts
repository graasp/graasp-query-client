import { StatusCodes } from 'http-status-codes';
import Cookies from 'js-cookie';
import nock from 'nock';
import { act } from 'react-test-renderer';

import { HttpMethod, ItemLoginSchemaType } from '@graasp/sdk';
import { SUCCESS_MESSAGES } from '@graasp/translations';

import {
  ITEMS,
  ITEM_LOGIN_RESPONSE,
  MEMBER_RESPONSE,
} from '../../test/constants';
import { mockMutation, setUpTest, waitForMutation } from '../../test/utils';
import {
  buildPostItemLoginSignInRoute,
  buildPutItemLoginSchemaRoute,
} from '../api/routes';
import {
  CURRENT_MEMBER_KEY,
  OWN_ITEMS_KEY,
  buildItemLoginSchemaKey,
} from '../config/keys';
import { postItemLoginRoutine, putItemLoginSchemaRoutine } from '../routines';

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

  describe('usePutItemLoginSchema', () => {
    const route = `/${buildPutItemLoginSchemaRoute(itemId)}`;
    const mutation = mutations.usePutItemLoginSchema;
    const loginSchema = ITEM_LOGIN_RESPONSE;
    const itemLoginKey = buildItemLoginSchemaKey(itemId);
    const newLoginSchema = ItemLoginSchemaType.UsernameAndPassword;

    it('Put item login schema', async () => {
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
        type: putItemLoginSchemaRoutine.SUCCESS,
        payload: { message: SUCCESS_MESSAGES.PUT_ITEM_LOGIN_SCHEMA },
      });
    });

    it('Unauthorized to put item login schema', async () => {
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
          type: putItemLoginSchemaRoutine.FAILURE,
        }),
      );
    });
  });
});

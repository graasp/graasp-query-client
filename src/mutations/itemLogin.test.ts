/* eslint-disable import/no-extraneous-dependencies */
import { StatusCodes } from 'http-status-codes';
import nock from 'nock';
import { Map } from 'immutable';
import { act } from 'react-test-renderer';
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
import { REQUEST_METHODS } from '../api/utils';
import {
  buildItemLoginKey,
  CURRENT_MEMBER_KEY,
  MUTATION_KEYS,
  OWN_ITEMS_KEY,
} from '../config/keys';
import { postItemLoginRoutine, putItemLoginRoutine } from '../routines';
import { ITEM_LOGIN_SCHEMAS } from '../types';

const mockedNotifier = jest.fn();
const { wrapper, queryClient, useMutation } = setUpTest({
  notifier: mockedNotifier,
});
describe('Item Login Mutations', () => {
  afterEach(() => {
    queryClient.clear();
    nock.cleanAll();
  });

  const { name: username, id: memberId } = MEMBER_RESPONSE;
  const password = 'password';
  const itemId = ITEMS[0].id;
  describe(MUTATION_KEYS.POST_ITEM_LOGIN, () => {
    const route = `/${buildPostItemLoginSignInRoute(itemId)}`;
    const mutation = () => useMutation(MUTATION_KEYS.POST_ITEM_LOGIN);
    it('Post item login', async () => {
      queryClient.setQueryData(CURRENT_MEMBER_KEY, MEMBER_RESPONSE);
      queryClient.setQueryData(OWN_ITEMS_KEY, ITEMS);

      const endpoints = [
        {
          response: {},
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

  describe(MUTATION_KEYS.PUT_ITEM_LOGIN, () => {
    const route = `/${buildPutItemLoginSchema(itemId)}`;
    const mutation = () => useMutation(MUTATION_KEYS.PUT_ITEM_LOGIN);
    const loginSchema = ITEM_LOGIN_RESPONSE;
    const itemLoginKey = buildItemLoginKey(itemId);
    const newLoginSchema = ITEM_LOGIN_SCHEMAS.USERNAME_AND_PASSWORD;

    it('Put item login', async () => {
      queryClient.setQueryData(itemLoginKey, Map(loginSchema));

      const endpoints = [
        {
          response: {},
          method: REQUEST_METHODS.PUT,
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
      });
    });

    it('Unauthorized to put item login', async () => {
      queryClient.setQueryData(itemLoginKey, Map(loginSchema));

      const endpoints = [
        {
          response: {},
          statusCode: StatusCodes.UNAUTHORIZED,
          method: REQUEST_METHODS.PUT,
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

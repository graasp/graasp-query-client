import {
  AccountFactory,
  FolderItemFactory,
  HttpMethod,
  ItemLoginSchemaType,
  MemberFactory,
} from '@graasp/sdk';
import { SUCCESS_MESSAGES } from '@graasp/translations';

import { act } from '@testing-library/react';
import { StatusCodes } from 'http-status-codes';
import nock from 'nock';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ITEM_LOGIN_RESPONSE } from '../../test/constants.js';
import { mockMutation, setUpTest, waitForMutation } from '../../test/utils.js';
import { OWN_ITEMS_KEY, itemKeys, memberKeys } from '../keys.js';
import {
  buildPostItemLoginSignInRoute,
  buildPutItemLoginSchemaRoute,
} from '../routes.js';
import {
  postItemLoginRoutine,
  putItemLoginSchemaRoutine,
} from '../routines/itemLogin.js';

const mockedNotifier = vi.fn();
const { wrapper, queryClient, mutations } = setUpTest({
  notifier: mockedNotifier,
});

describe('Item Login Mutations', () => {
  afterEach(() => {
    queryClient.clear();
    nock.cleanAll();
  });

  const { name: username, id: memberId } = AccountFactory();
  const password = 'password';
  const itemId = FolderItemFactory().id;
  const items = [FolderItemFactory(), FolderItemFactory(), FolderItemFactory()];
  describe('usePostItemLogin', () => {
    const route = `/${buildPostItemLoginSignInRoute(itemId)}`;
    const mutation = mutations.usePostItemLogin;
    it('Post item login', async () => {
      queryClient.setQueryData(memberKeys.current().content, MemberFactory());
      // todo: change to Accessible ?
      queryClient.setQueryData(OWN_ITEMS_KEY, items);

      const endpoints = [
        {
          response: {},
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
        mockedMutation.mutate({
          itemId,
          username,
          memberId,
          password,
        });
        await waitForMutation();
      });

      // check all set keys are reset
      expect(
        queryClient.getQueryData(memberKeys.current().content),
      ).toBeFalsy();
      // todo: change to Accessible
      expect(queryClient.getQueryData(OWN_ITEMS_KEY)).toBeFalsy();
    });

    it('Unauthorized to post item login', async () => {
      queryClient.setQueryData(memberKeys.current().content, MemberFactory());
      // todo: change to Accessible ?
      queryClient.setQueryData(OWN_ITEMS_KEY, items);

      const endpoints = [
        {
          response: {},
          statusCode: StatusCodes.UNAUTHORIZED,
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
        mockedMutation.mutate({
          itemId,
          username,
          memberId,
          password,
        });
        await waitForMutation();
      });

      // check all set keys are reset
      expect(
        queryClient.getQueryData(memberKeys.current().content),
      ).toBeFalsy();
      // todo: change to Accessible ?
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
    const itemLoginKey = itemKeys.single(itemId).itemLoginSchema.content;
    const newLoginSchema = ItemLoginSchemaType.UsernameAndPassword;

    it('Put item login schema', async () => {
      queryClient.setQueryData(itemLoginKey, loginSchema);

      const endpoints = [
        {
          response: {},
          method: HttpMethod.Put,
          route,
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        mockedMutation.mutate({ itemId, type: newLoginSchema });
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
          method: HttpMethod.Put,
          route,
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        mockedMutation.mutate({
          itemId,
          type: newLoginSchema,
        });
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

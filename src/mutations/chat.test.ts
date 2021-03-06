/* eslint-disable import/no-extraneous-dependencies */
import { act } from '@testing-library/react-hooks';
import nock from 'nock';
import Cookies from 'js-cookie';
import { StatusCodes } from 'http-status-codes';
import {
  buildClearItemChatRoute,
  buildDeleteItemChatMessageRoute,
  buildPatchItemChatMessageRoute,
  buildPostItemChatMessageRoute,
} from '../api/routes';
import { setUpTest, mockMutation, waitForMutation } from '../../test/utils';
import {
  ITEMS,
  ITEM_CHAT,
  OK_RESPONSE,
  UNAUTHORIZED_RESPONSE,
  MESSAGE_IDS,
} from '../../test/constants';
import { buildItemChatKey, MUTATION_KEYS } from '../config/keys';
import { REQUEST_METHODS } from '../api/utils';
import {
  clearItemChatRoutine,
  deleteItemChatMessageRoutine,
  patchItemChatMessageRoutine,
  postItemChatMessageRoutine,
} from '../routines';

jest.spyOn(Cookies, 'get').mockReturnValue({ session: 'somesession' });

describe('Chat Mutations', () => {
  const itemId = ITEMS[0].id;
  const chatId = itemId;
  const chatKey = buildItemChatKey(itemId);
  const messageId = MESSAGE_IDS[0];

  describe('enableWebsockets = false', () => {
    const mockedNotifier = jest.fn();
    const { wrapper, queryClient, useMutation } = setUpTest({
      notifier: mockedNotifier,
    });

    afterEach(() => {
      queryClient.clear();
      nock.cleanAll();
    });

    describe(MUTATION_KEYS.POST_ITEM_CHAT_MESSAGE, () => {
      const route = `/${buildPostItemChatMessageRoute(itemId)}`;
      const mutation = () => useMutation(MUTATION_KEYS.POST_ITEM_CHAT_MESSAGE);

      it(`Post item chat message`, async () => {
        const endpoints = [
          { route, response: OK_RESPONSE, method: REQUEST_METHODS.POST },
        ];
        // set random data in cache
        queryClient.setQueryData(chatKey, ITEM_CHAT);

        const mockedMutation = await mockMutation({
          endpoints,
          mutation,
          wrapper,
        });

        await act(async () => {
          await mockedMutation.mutate({ chatId, body: 'new message' });
          await waitForMutation();
        });

        // verify cache keys
        expect(queryClient.getQueryState(chatKey)?.isInvalidated).toBeTruthy();
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
        // set random data in cache
        queryClient.setQueryData(chatKey, ITEM_CHAT);

        const mockedMutation = await mockMutation({
          endpoints,
          mutation,
          wrapper,
        });

        await act(async () => {
          await mockedMutation.mutate({ chatId, body: 'new message' });
          await waitForMutation();
        });

        // verify cache keys
        expect(queryClient.getQueryState(chatKey)?.isInvalidated).toBeTruthy();
        expect(mockedNotifier).toHaveBeenCalledWith(
          expect.objectContaining({
            type: postItemChatMessageRoutine.FAILURE,
          }),
        );
      });
    });

    describe(MUTATION_KEYS.PATCH_ITEM_CHAT_MESSAGE, () => {
      const route = `/${buildPatchItemChatMessageRoute(itemId, messageId)}`;
      const mutation = () => useMutation(MUTATION_KEYS.PATCH_ITEM_CHAT_MESSAGE);

      it(`Patch item chat message`, async () => {
        const endpoints = [
          { route, response: OK_RESPONSE, method: REQUEST_METHODS.PATCH },
        ];
        // set random data in cache
        queryClient.setQueryData(chatKey, ITEM_CHAT);

        const mockedMutation = await mockMutation({
          endpoints,
          mutation,
          wrapper,
        });

        await act(async () => {
          await mockedMutation.mutate({
            chatId,
            messageId,
            body: 'Updated message',
          });
          await waitForMutation();
        });

        // verify cache keys
        expect(queryClient.getQueryState(chatKey)?.isInvalidated).toBeTruthy();
      });

      it(`Unauthorized`, async () => {
        const endpoints = [
          {
            route,
            response: UNAUTHORIZED_RESPONSE,
            method: REQUEST_METHODS.PATCH,
            statusCode: StatusCodes.UNAUTHORIZED,
          },
        ];
        // set random data in cache
        queryClient.setQueryData(chatKey, ITEM_CHAT);

        const mockedMutation = await mockMutation({
          endpoints,
          mutation,
          wrapper,
        });

        await act(async () => {
          await mockedMutation.mutate({
            chatId,
            messageId,
            body: 'Updated message',
          });
          await waitForMutation();
        });

        // verify cache keys
        expect(queryClient.getQueryState(chatKey)?.isInvalidated).toBeTruthy();
        expect(mockedNotifier).toHaveBeenCalledWith(
          expect.objectContaining({
            type: patchItemChatMessageRoutine.FAILURE,
          }),
        );
      });
    });

    describe(MUTATION_KEYS.DELETE_ITEM_CHAT_MESSAGE, () => {
      const route = `/${buildDeleteItemChatMessageRoute(itemId, messageId)}`;
      const mutation = () =>
        useMutation(MUTATION_KEYS.DELETE_ITEM_CHAT_MESSAGE);

      it(`Delete item chat message`, async () => {
        const endpoints = [
          { route, response: OK_RESPONSE, method: REQUEST_METHODS.DELETE },
        ];
        // set random data in cache
        queryClient.setQueryData(chatKey, ITEM_CHAT);

        const mockedMutation = await mockMutation({
          endpoints,
          mutation,
          wrapper,
        });

        await act(async () => {
          await mockedMutation.mutate({ chatId, messageId });
          await waitForMutation();
        });

        // verify cache keys
        expect(queryClient.getQueryState(chatKey)?.isInvalidated).toBeTruthy();
      });

      it(`Unauthorized`, async () => {
        const endpoints = [
          {
            route,
            response: UNAUTHORIZED_RESPONSE,
            method: REQUEST_METHODS.DELETE,
            statusCode: StatusCodes.UNAUTHORIZED,
          },
        ];
        // set random data in cache
        queryClient.setQueryData(chatKey, ITEM_CHAT);

        const mockedMutation = await mockMutation({
          endpoints,
          mutation,
          wrapper,
        });

        await act(async () => {
          await mockedMutation.mutate({ chatId, messageId });
          await waitForMutation();
        });

        // verify cache keys
        expect(queryClient.getQueryState(chatKey)?.isInvalidated).toBeTruthy();
        expect(mockedNotifier).toHaveBeenCalledWith(
          expect.objectContaining({
            type: deleteItemChatMessageRoutine.FAILURE,
          }),
        );
      });
    });

    describe(MUTATION_KEYS.CLEAR_ITEM_CHAT, () => {
      const route = `/${buildClearItemChatRoute(itemId)}`;
      const mutation = () => useMutation(MUTATION_KEYS.CLEAR_ITEM_CHAT);

      it(`Clear chat`, async () => {
        const endpoints = [
          { route, response: OK_RESPONSE, method: REQUEST_METHODS.DELETE },
        ];
        // set random data in cache
        queryClient.setQueryData(chatKey, ITEM_CHAT);

        const mockedMutation = await mockMutation({
          endpoints,
          mutation,
          wrapper,
        });

        await act(async () => {
          await mockedMutation.mutate(chatId);
          await waitForMutation();
        });

        // verify cache keys
        expect(queryClient.getQueryState(chatKey)?.isInvalidated).toBeTruthy();
      });

      it(`Unauthorized`, async () => {
        const endpoints = [
          {
            route,
            response: UNAUTHORIZED_RESPONSE,
            method: REQUEST_METHODS.DELETE,
            statusCode: StatusCodes.UNAUTHORIZED,
          },
        ];
        // set random data in cache
        queryClient.setQueryData(chatKey, ITEM_CHAT);

        const mockedMutation = await mockMutation({
          endpoints,
          mutation,
          wrapper,
        });

        await act(async () => {
          await mockedMutation.mutate(chatId);
          await waitForMutation();
        });

        // verify cache keys
        expect(queryClient.getQueryState(chatKey)?.isInvalidated).toBeTruthy();
        expect(mockedNotifier).toHaveBeenCalledWith(
          expect.objectContaining({
            type: clearItemChatRoutine.FAILURE,
          }),
        );
      });
    });
  });

  describe('enableWebsockets = true', () => {
    const { wrapper, queryClient, useMutation } = setUpTest({
      enableWebsocket: true,
    });

    afterEach(() => {
      queryClient.clear();
      nock.cleanAll();
    });

    describe(MUTATION_KEYS.POST_ITEM_CHAT_MESSAGE, () => {
      const route = `/${buildPostItemChatMessageRoute(itemId)}`;
      const mutation = () => useMutation(MUTATION_KEYS.POST_ITEM_CHAT_MESSAGE);
      it(`Post item chat message`, async () => {
        const endpoints = [
          { route, response: OK_RESPONSE, method: REQUEST_METHODS.POST },
        ];
        // set random data in cache
        queryClient.setQueryData(chatKey, ITEM_CHAT);

        const mockedMutation = await mockMutation({
          endpoints,
          mutation,
          wrapper,
        });

        await act(async () => {
          await mockedMutation.mutate({ chatId, body: 'new message' });
          await waitForMutation();
        });

        // verify cache keys
        expect(queryClient.getQueryState(chatKey)?.isInvalidated).toBeFalsy();
      });
    });

    describe(MUTATION_KEYS.PATCH_ITEM_CHAT_MESSAGE, () => {
      const route = `/${buildPatchItemChatMessageRoute(itemId, messageId)}`;
      const mutation = () => useMutation(MUTATION_KEYS.PATCH_ITEM_CHAT_MESSAGE);
      it(`Patch item chat message`, async () => {
        const endpoints = [
          { route, response: OK_RESPONSE, method: REQUEST_METHODS.PATCH },
        ];
        // set random data in cache
        queryClient.setQueryData(chatKey, ITEM_CHAT);

        const mockedMutation = await mockMutation({
          endpoints,
          mutation,
          wrapper,
        });

        await act(async () => {
          await mockedMutation.mutate({ chatId, body: 'new message content' });
          await waitForMutation();
        });

        // verify cache keys
        expect(queryClient.getQueryState(chatKey)?.isInvalidated).toBeFalsy();
      });
    });

    describe(MUTATION_KEYS.DELETE_ITEM_CHAT_MESSAGE, () => {
      const route = `/${buildDeleteItemChatMessageRoute(itemId, messageId)}`;
      const mutation = () =>
        useMutation(MUTATION_KEYS.DELETE_ITEM_CHAT_MESSAGE);
      it(`Delete item chat message`, async () => {
        const endpoints = [
          { route, response: OK_RESPONSE, method: REQUEST_METHODS.DELETE },
        ];
        // set random data in cache
        queryClient.setQueryData(chatKey, ITEM_CHAT);

        const mockedMutation = await mockMutation({
          endpoints,
          mutation,
          wrapper,
        });

        await act(async () => {
          await mockedMutation.mutate({ chatId, body: 'message to remove' });
          await waitForMutation();
        });

        // verify cache keys
        expect(queryClient.getQueryState(chatKey)?.isInvalidated).toBeFalsy();
      });
    });

    describe(MUTATION_KEYS.CLEAR_ITEM_CHAT, () => {
      const route = `/${buildClearItemChatRoute(itemId)}`;
      const mutation = () => useMutation(MUTATION_KEYS.CLEAR_ITEM_CHAT);
      it(`Clear chat`, async () => {
        const endpoints = [
          { route, response: OK_RESPONSE, method: REQUEST_METHODS.DELETE },
        ];
        // set random data in cache
        queryClient.setQueryData(chatKey, ITEM_CHAT);

        const mockedMutation = await mockMutation({
          endpoints,
          mutation,
          wrapper,
        });

        await act(async () => {
          await mockedMutation.mutate(itemId);
          await waitForMutation();
        });

        // verify cache keys
        expect(queryClient.getQueryState(chatKey)?.isInvalidated).toBeFalsy();
      });
    });
  });
});

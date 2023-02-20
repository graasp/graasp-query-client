/* eslint-disable import/no-extraneous-dependencies */
import { act } from '@testing-library/react-hooks';
import { StatusCodes } from 'http-status-codes';
import Cookies from 'js-cookie';
import nock from 'nock';

import { HttpMethod } from '@graasp/sdk';

import {
  ITEMS,
  ITEM_CHAT,
  MESSAGE_IDS,
  OK_RESPONSE,
  UNAUTHORIZED_RESPONSE,
} from '../../test/constants';
import { mockMutation, setUpTest, waitForMutation } from '../../test/utils';
import {
  buildClearItemChatRoute,
  buildDeleteItemChatMessageRoute,
  buildPatchItemChatMessageRoute,
  buildPostItemChatMessageRoute,
} from '../api/routes';
import { MUTATION_KEYS, buildItemChatKey } from '../config/keys';
import {
  clearItemChatRoutine,
  deleteItemChatMessageRoutine,
  patchItemChatMessageRoutine,
  postItemChatMessageRoutine,
} from '../routines';

jest.spyOn(Cookies, 'get').mockReturnValue({ session: 'somesession' });

describe('Chat Mutations', () => {
  const itemId = ITEMS.first()!.id;
  const chatId = itemId;
  const chatKey = buildItemChatKey(itemId);
  const messageId = MESSAGE_IDS[0];

  describe('enableWebsockets = false', () => {
    const mockedNotifier = jest.fn();
    const { wrapper, queryClient, mutations } = setUpTest({
      notifier: mockedNotifier,
    });

    afterEach(() => {
      queryClient.clear();
      nock.cleanAll();
    });

    describe(MUTATION_KEYS.POST_ITEM_CHAT_MESSAGE, () => {
      const route = `/${buildPostItemChatMessageRoute(itemId)}`;
      const mutation = mutations.usePostItemChatMessage;

      it(`Post item chat message`, async () => {
        const endpoints = [
          { route, response: OK_RESPONSE, method: HttpMethod.POST },
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
            method: HttpMethod.POST,
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
      const mutation = mutations.usePatchItemChatMessage;

      it(`Patch item chat message`, async () => {
        const endpoints = [
          { route, response: OK_RESPONSE, method: HttpMethod.PATCH },
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
            method: HttpMethod.PATCH,
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

      const mutation = mutations.useDeleteItemChatMessage;

      it(`Delete item chat message`, async () => {
        const endpoints = [
          { route, response: OK_RESPONSE, method: HttpMethod.DELETE },
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
            method: HttpMethod.DELETE,
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
      const mutation = mutations.useClearItemChat;

      it(`Clear chat`, async () => {
        const endpoints = [
          { route, response: OK_RESPONSE, method: HttpMethod.DELETE },
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
            method: HttpMethod.DELETE,
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
    const { wrapper, queryClient, mutations } = setUpTest({
      enableWebsocket: true,
    });

    afterEach(() => {
      queryClient.clear();
      nock.cleanAll();
    });

    describe(MUTATION_KEYS.POST_ITEM_CHAT_MESSAGE, () => {
      const route = `/${buildPostItemChatMessageRoute(itemId)}`;
      const mutation = mutations.usePostItemChatMessage;
      it(`Post item chat message`, async () => {
        const endpoints = [
          { route, response: OK_RESPONSE, method: HttpMethod.POST },
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

      const mutation = mutations.usePatchItemChatMessage;
      it(`Patch item chat message`, async () => {
        const endpoints = [
          { route, response: OK_RESPONSE, method: HttpMethod.PATCH },
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

      const mutation = mutations.useDeleteItemChatMessage;
      it(`Delete item chat message`, async () => {
        const endpoints = [
          { route, response: OK_RESPONSE, method: HttpMethod.DELETE },
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
      const mutation = mutations.useClearItemChat;
      it(`Clear chat`, async () => {
        const endpoints = [
          { route, response: OK_RESPONSE, method: HttpMethod.DELETE },
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

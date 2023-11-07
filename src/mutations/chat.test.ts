/* eslint-disable import/no-extraneous-dependencies */
import { HttpMethod } from '@graasp/sdk';

import { act } from '@testing-library/react';
import { StatusCodes } from 'http-status-codes';
import nock from 'nock';

import {
  CHAT_MESSAGES,
  ITEMS,
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
import { buildItemChatKey } from '../config/keys';
import {
  clearItemChatRoutine,
  deleteItemChatMessageRoutine,
  patchItemChatMessageRoutine,
  postItemChatMessageRoutine,
} from '../routines';

describe('Chat Mutations', () => {
  const itemId = ITEMS[0].id;
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

    describe('usePostItemChatMessage', () => {
      const route = `/${buildPostItemChatMessageRoute(itemId)}`;
      const mutation = mutations.usePostItemChatMessage;

      it(`Post item chat message`, async () => {
        const endpoints = [
          { route, response: OK_RESPONSE, method: HttpMethod.POST },
        ];
        // set random data in cache
        queryClient.setQueryData(chatKey, CHAT_MESSAGES);

        const mockedMutation = await mockMutation({
          endpoints,
          mutation,
          wrapper,
        });

        await act(async () => {
          await mockedMutation.mutate({ itemId, body: 'new message' });
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
        queryClient.setQueryData(chatKey, CHAT_MESSAGES);

        const mockedMutation = await mockMutation({
          endpoints,
          mutation,
          wrapper,
        });

        await act(async () => {
          await mockedMutation.mutate({ itemId, body: 'new message' });
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

    describe('usePatchItemChatMessage', () => {
      const route = `/${buildPatchItemChatMessageRoute(itemId, messageId)}`;
      const mutation = mutations.usePatchItemChatMessage;

      it(`Patch item chat message`, async () => {
        const endpoints = [
          { route, response: OK_RESPONSE, method: HttpMethod.PATCH },
        ];
        // set random data in cache
        queryClient.setQueryData(chatKey, CHAT_MESSAGES);

        const mockedMutation = await mockMutation({
          endpoints,
          mutation,
          wrapper,
        });

        await act(async () => {
          await mockedMutation.mutate({
            itemId,
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
        queryClient.setQueryData(chatKey, CHAT_MESSAGES);

        const mockedMutation = await mockMutation({
          endpoints,
          mutation,
          wrapper,
        });

        await act(async () => {
          await mockedMutation.mutate({
            itemId,
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

    describe('useDeleteItemChatMessage', () => {
      const route = `/${buildDeleteItemChatMessageRoute(itemId, messageId)}`;

      const mutation = mutations.useDeleteItemChatMessage;

      it(`Delete item chat message`, async () => {
        const endpoints = [
          { route, response: OK_RESPONSE, method: HttpMethod.DELETE },
        ];
        // set random data in cache
        queryClient.setQueryData(chatKey, CHAT_MESSAGES);

        const mockedMutation = await mockMutation({
          endpoints,
          mutation,
          wrapper,
        });

        await act(async () => {
          await mockedMutation.mutate({ itemId, messageId });
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
        queryClient.setQueryData(chatKey, CHAT_MESSAGES);

        const mockedMutation = await mockMutation({
          endpoints,
          mutation,
          wrapper,
        });

        await act(async () => {
          await mockedMutation.mutate({ itemId, messageId });
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

    describe('useClearItemChat', () => {
      const route = `/${buildClearItemChatRoute(itemId)}`;
      const mutation = mutations.useClearItemChat;

      it(`Clear chat`, async () => {
        const endpoints = [
          { route, response: OK_RESPONSE, method: HttpMethod.DELETE },
        ];
        // set random data in cache
        queryClient.setQueryData(chatKey, CHAT_MESSAGES);

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
        queryClient.setQueryData(chatKey, CHAT_MESSAGES);

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

    describe('usePostItemChatMessage', () => {
      const route = `/${buildPostItemChatMessageRoute(itemId)}`;
      const mutation = mutations.usePostItemChatMessage;
      it(`Post item chat message`, async () => {
        const endpoints = [
          { route, response: OK_RESPONSE, method: HttpMethod.POST },
        ];
        // set random data in cache
        queryClient.setQueryData(chatKey, CHAT_MESSAGES);

        const mockedMutation = await mockMutation({
          endpoints,
          mutation,
          wrapper,
        });

        await act(async () => {
          await mockedMutation.mutate({ itemId, body: 'new message' });
          await waitForMutation();
        });

        // verify cache keys
        expect(queryClient.getQueryState(chatKey)?.isInvalidated).toBeFalsy();
      });
    });

    describe('usePatchItemChatMessage', () => {
      const route = `/${buildPatchItemChatMessageRoute(itemId, messageId)}`;
      const mutation = mutations.usePatchItemChatMessage;

      it(`Patch item chat message`, async () => {
        const endpoints = [
          { route, response: OK_RESPONSE, method: HttpMethod.PATCH },
        ];
        // set random data in cache
        queryClient.setQueryData(chatKey, CHAT_MESSAGES);

        const mockedMutation = await mockMutation({
          endpoints,
          mutation,
          wrapper,
        });

        await act(async () => {
          await mockedMutation.mutate({
            itemId,
            messageId,
            body: 'new message content',
          });
          await waitForMutation();
        });

        // verify cache keys
        expect(queryClient.getQueryState(chatKey)?.isInvalidated).toBeFalsy();
      });
    });

    describe('useDeleteItemChatMessage', () => {
      const route = `/${buildDeleteItemChatMessageRoute(itemId, messageId)}`;
      const mutation = mutations.useDeleteItemChatMessage;

      it(`Delete item chat message`, async () => {
        const endpoints = [
          { route, response: OK_RESPONSE, method: HttpMethod.DELETE },
        ];
        // set random data in cache
        queryClient.setQueryData(chatKey, CHAT_MESSAGES);

        const mockedMutation = await mockMutation({
          endpoints,
          mutation,
          wrapper,
        });

        await act(async () => {
          await mockedMutation.mutate({
            itemId,
            messageId,
          });
          await waitForMutation();
        });

        // verify cache keys
        expect(queryClient.getQueryState(chatKey)?.isInvalidated).toBeFalsy();
      });
    });

    describe('useClearItemChat', () => {
      const route = `/${buildClearItemChatRoute(itemId)}`;
      const mutation = mutations.useClearItemChat;

      it(`Clear chat`, async () => {
        const endpoints = [
          { route, response: OK_RESPONSE, method: HttpMethod.DELETE },
        ];
        // set random data in cache
        queryClient.setQueryData(chatKey, CHAT_MESSAGES);

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

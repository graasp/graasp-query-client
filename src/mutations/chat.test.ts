import { FolderItemFactory, HttpMethod } from '@graasp/sdk';

import { act } from '@testing-library/react';
import { StatusCodes } from 'http-status-codes';
import nock from 'nock';
import { v4 } from 'uuid';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  CHAT_MESSAGES,
  OK_RESPONSE,
  UNAUTHORIZED_RESPONSE,
} from '../../test/constants.js';
import { mockMutation, setUpTest, waitForMutation } from '../../test/utils.js';
import { buildItemChatKey } from '../keys.js';
import {
  buildClearItemChatRoute,
  buildDeleteItemChatMessageRoute,
  buildPatchItemChatMessageRoute,
  buildPostItemChatMessageRoute,
} from '../routes.js';
import {
  clearItemChatRoutine,
  deleteItemChatMessageRoutine,
  patchItemChatMessageRoutine,
  postItemChatMessageRoutine,
} from '../routines/chat.js';

describe('Chat Mutations', () => {
  const itemId = FolderItemFactory().id;
  const chatKey = buildItemChatKey(itemId);
  const messageId = v4();

  describe('enableWebsockets = false', () => {
    const mockedNotifier = vi.fn();
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
          { route, response: OK_RESPONSE, method: HttpMethod.Post },
        ];
        // set random data in cache
        queryClient.setQueryData(chatKey, CHAT_MESSAGES);

        const mockedMutation = await mockMutation({
          endpoints,
          mutation,
          wrapper,
        });

        await act(async () => {
          mockedMutation.mutate({ itemId, body: 'new message' });
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
            method: HttpMethod.Post,
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
          mockedMutation.mutate({ itemId, body: 'new message' });
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
          { route, response: OK_RESPONSE, method: HttpMethod.Patch },
        ];
        // set random data in cache
        queryClient.setQueryData(chatKey, CHAT_MESSAGES);

        const mockedMutation = await mockMutation({
          endpoints,
          mutation,
          wrapper,
        });

        await act(async () => {
          mockedMutation.mutate({
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
            method: HttpMethod.Patch,
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
          mockedMutation.mutate({
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
          { route, response: OK_RESPONSE, method: HttpMethod.Delete },
        ];
        // set random data in cache
        queryClient.setQueryData(chatKey, CHAT_MESSAGES);

        const mockedMutation = await mockMutation({
          endpoints,
          mutation,
          wrapper,
        });

        await act(async () => {
          mockedMutation.mutate({ itemId, messageId });
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
            method: HttpMethod.Delete,
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
          mockedMutation.mutate({ itemId, messageId });
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
          { route, response: OK_RESPONSE, method: HttpMethod.Delete },
        ];
        // set random data in cache
        queryClient.setQueryData(chatKey, CHAT_MESSAGES);

        const mockedMutation = await mockMutation({
          endpoints,
          mutation,
          wrapper,
        });

        await act(async () => {
          mockedMutation.mutate(itemId);
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
            method: HttpMethod.Delete,
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
          mockedMutation.mutate(itemId);
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
          { route, response: OK_RESPONSE, method: HttpMethod.Post },
        ];
        // set random data in cache
        queryClient.setQueryData(chatKey, CHAT_MESSAGES);

        const mockedMutation = await mockMutation({
          endpoints,
          mutation,
          wrapper,
        });

        await act(async () => {
          mockedMutation.mutate({ itemId, body: 'new message' });
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
          { route, response: OK_RESPONSE, method: HttpMethod.Patch },
        ];
        // set random data in cache
        queryClient.setQueryData(chatKey, CHAT_MESSAGES);

        const mockedMutation = await mockMutation({
          endpoints,
          mutation,
          wrapper,
        });

        await act(async () => {
          mockedMutation.mutate({
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
          { route, response: OK_RESPONSE, method: HttpMethod.Delete },
        ];
        // set random data in cache
        queryClient.setQueryData(chatKey, CHAT_MESSAGES);

        const mockedMutation = await mockMutation({
          endpoints,
          mutation,
          wrapper,
        });

        await act(async () => {
          mockedMutation.mutate({
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
          { route, response: OK_RESPONSE, method: HttpMethod.Delete },
        ];
        // set random data in cache
        queryClient.setQueryData(chatKey, CHAT_MESSAGES);

        const mockedMutation = await mockMutation({
          endpoints,
          mutation,
          wrapper,
        });

        await act(async () => {
          mockedMutation.mutate(itemId);
          await waitForMutation();
        });

        // verify cache keys
        expect(queryClient.getQueryState(chatKey)?.isInvalidated).toBeFalsy();
      });
    });
  });
});

/* eslint-disable import/no-extraneous-dependencies */
import { StatusCodes } from 'http-status-codes';
import Cookies from 'js-cookie';
import nock from 'nock';

import { ChatMessage } from '@graasp/sdk';
import { ExportedItemChatRecord, ItemChatRecord } from '@graasp/sdk/frontend';

import {
  ITEMS,
  UNAUTHORIZED_RESPONSE,
  createMockExportedItemChat,
  createMockItemChat,
} from '../../test/constants';
import { mockHook, setUpTest } from '../../test/utils';
import { buildExportItemChatRoute, buildGetItemChatRoute } from '../api/routes';
import { buildExportItemChatKey, buildItemChatKey } from '../config/keys';

const { hooks, wrapper, queryClient } = setUpTest();

jest.spyOn(Cookies, 'get').mockReturnValue({ session: 'somesession' });

describe('Chat Hooks', () => {
  afterEach(() => {
    nock.cleanAll();
    queryClient.clear();
  });

  describe('useItemChat', () => {
    const itemId = ITEMS.first()!.id;
    const mockMessage: ChatMessage = {
      id: 'some-messageId',
      chatId: itemId,
      body: 'some content',
      creator: 'some-user',
      createdAt: 'some Date',
      updatedAt: 'some other Date',
    };
    const route = `/${buildGetItemChatRoute(itemId)}`;
    const key = buildItemChatKey(itemId);

    const hook = () => hooks.useItemChat(itemId);

    it(`Receive chat messages`, async () => {
      const response: ItemChatRecord = createMockItemChat(itemId, [
        mockMessage,
      ]);
      const endpoints = [
        {
          route,
          response,
        },
      ];
      const { data } = await mockHook({
        endpoints,
        hook,
        wrapper,
      });

      expect(data as ItemChatRecord).toEqualImmutable(response);

      // verify cache keys
      expect(queryClient.getQueryData(key)).toEqualImmutable(response);
    });

    it(`Unauthorized`, async () => {
      const endpoints = [
        {
          route,
          response: UNAUTHORIZED_RESPONSE,
          statusCode: StatusCodes.UNAUTHORIZED,
        },
      ];
      const { data, isError } = await mockHook({
        hook,
        wrapper,
        endpoints,
      });

      expect(data).toBeFalsy();
      expect(isError).toBeTruthy();
      // verify cache keys
      expect(queryClient.getQueryData(key)).toBeFalsy();
    });
  });

  describe('useItemChat with arguments', () => {
    const itemId = ITEMS.first()!.id;
    const mockMessage: ChatMessage = {
      id: 'some-messageId',
      chatId: itemId,
      body: 'some content',
      creator: 'some-user',
      createdAt: 'some Date',
      updatedAt: 'some other Date',
    };
    const route = `/${buildGetItemChatRoute(itemId)}`;
    const key = buildItemChatKey(itemId);

    it(`getUpdates = true`, async () => {
      const hook = () => hooks.useItemChat(itemId, { getUpdates: true });

      const response = createMockItemChat(itemId, [mockMessage]);
      const endpoints = [
        {
          route,
          response,
        },
      ];
      const { data } = await mockHook({
        endpoints,
        hook,
        wrapper,
      });

      expect(data as ItemChatRecord).toEqualImmutable(response);

      // verify cache keys
      expect(queryClient.getQueryData(key)).toEqualImmutable(response);
    });

    it(`getUpdates = false`, async () => {
      const hook = () => hooks.useItemChat(itemId, { getUpdates: false });
      const response = createMockItemChat(itemId, [mockMessage]);
      const endpoints = [
        {
          route,
          response,
        },
      ];
      const { data } = await mockHook({
        endpoints,
        hook,
        wrapper,
      });

      expect(data as ItemChatRecord).toEqualImmutable(response);

      // verify cache keys
      expect(queryClient.getQueryData(key)).toEqualImmutable(response);
    });
  });

  describe('useItemChat', () => {
    const itemId = ITEMS.first()!.id;
    const route = `/${buildExportItemChatRoute(itemId)}`;
    const key = buildExportItemChatKey(itemId);

    const hook = () => hooks.useExportItemChat(itemId);

    it(`Receive exported chat`, async () => {
      const response: ExportedItemChatRecord = createMockExportedItemChat(
        itemId,
        [
          {
            id: 'some-id',
            chatId: itemId,
            body: 'some content',
            createdAt: 'some date',
            updatedAt: 'some other date',
            creator: 'some memberId',
            creatorName: 'A user name',
          },
        ],
      );
      const endpoints = [
        {
          route,
          response,
        },
      ];
      const { data } = await mockHook({
        endpoints,
        hook,
        wrapper,
      });

      expect(data as ExportedItemChatRecord).toEqualImmutable(response);

      // verify cache keys
      expect(queryClient.getQueryData(key)).toEqualImmutable(response);
    });

    it(`Unauthorized`, async () => {
      const endpoints = [
        {
          route,
          response: UNAUTHORIZED_RESPONSE,
          statusCode: StatusCodes.UNAUTHORIZED,
        },
      ];
      const { data, isError } = await mockHook({
        hook,
        wrapper,
        endpoints,
      });

      expect(data).toBeFalsy();
      expect(isError).toBeTruthy();
      // verify cache keys
      expect(queryClient.getQueryData(key)).toBeFalsy();
    });
  });
});

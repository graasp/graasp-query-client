/* eslint-disable import/no-extraneous-dependencies */
import { ChatMessage } from '@graasp/sdk';
import { ExportedItemChatRecord, ItemChatRecord } from '@graasp/sdk/frontend';

import { StatusCodes } from 'http-status-codes';
import Immutable from 'immutable';
import Cookies from 'js-cookie';
import nock from 'nock';

import {
  ITEMS_JS,
  MOCK_ITEM,
  MOCK_MEMBER,
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
    const itemId = ITEMS_JS[0].id;
    const mockMessage: ChatMessage = {
      id: 'some-messageId',
      item: MOCK_ITEM,
      body: 'some content',
      creator: MOCK_MEMBER,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const route = `/${buildGetItemChatRoute(itemId)}`;
    const key = buildItemChatKey(itemId);

    const hook = () => hooks.useItemChat(itemId);

    it(`Receive chat messages`, async () => {
      const response: ItemChatRecord = createMockItemChat([mockMessage]);
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

      expect(Immutable.is(data, response)).toBeTruthy();

      // verify cache keys
      expect(
        Immutable.is(queryClient.getQueryData(key), response),
      ).toBeTruthy();
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
    const itemId = ITEMS_JS[0].id;
    const mockMessage: ChatMessage = {
      id: 'some-messageId',
      item: MOCK_ITEM,
      body: 'some content',
      creator: MOCK_MEMBER,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const route = `/${buildGetItemChatRoute(itemId)}`;
    const key = buildItemChatKey(itemId);

    it(`getUpdates = true`, async () => {
      const hook = () => hooks.useItemChat(itemId, { getUpdates: true });

      const response = createMockItemChat([mockMessage]);
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

      expect(Immutable.is(data, response)).toBeTruthy();

      // verify cache keys
      expect(
        Immutable.is(queryClient.getQueryData(key), response),
      ).toBeTruthy();
    });

    it(`getUpdates = false`, async () => {
      const hook = () => hooks.useItemChat(itemId, { getUpdates: false });
      const response = createMockItemChat([mockMessage]);
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

      expect(Immutable.is(data, response)).toBeTruthy();

      // verify cache keys
      expect(
        Immutable.is(queryClient.getQueryData(key), response),
      ).toBeTruthy();
    });
  });

  describe('useItemChat', () => {
    const itemId = ITEMS_JS[0].id;
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
            createdAt: new Date(),
            updatedAt: new Date(),
            creator: MOCK_MEMBER,
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

      expect(Immutable.is(data, response)).toBeTruthy();

      // verify cache keys
      expect(
        Immutable.is(queryClient.getQueryData(key), response),
      ).toBeTruthy();
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

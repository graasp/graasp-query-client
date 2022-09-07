/* eslint-disable import/no-extraneous-dependencies */
import { StatusCodes } from 'http-status-codes';
import { Record, RecordOf } from 'immutable';
import Cookies from 'js-cookie';
import nock from 'nock';

import {
  ITEMS,
  UNAUTHORIZED_RESPONSE,
  buildChatMessages,
  buildExportedChat,
} from '../../test/constants';
import { mockHook, setUpTest } from '../../test/utils';
import { buildExportItemChatRoute, buildGetItemChatRoute } from '../api/routes';
import { buildExportItemChatKey, buildItemChatKey } from '../config/keys';
import type {
  ExportedItemChat,
  ExportedItemChatRecord,
  ItemChat,
  ItemChatRecord,
} from '../types';

const { hooks, wrapper, queryClient } = setUpTest();

jest.spyOn(Cookies, 'get').mockReturnValue({ session: 'somesession' });

describe('Chat Hooks', () => {
  afterEach(() => {
    nock.cleanAll();
    queryClient.clear();
  });

  describe('useItemChat', () => {
    const itemId = ITEMS.first()!.id;
    const route = `/${buildGetItemChatRoute(itemId)}`;
    const key = buildItemChatKey(itemId);

    const hook = () => hooks.useItemChat(itemId);

    it(`Receive chat messages`, async () => {
      const defaultItemChatMessageValues: ItemChat = {
        id: itemId,
        messages: buildChatMessages(itemId),
      };
      const createMockItemChatMessage: Record.Factory<ItemChat> = Record(
        defaultItemChatMessageValues,
      );
      const response: ItemChatRecord = createMockItemChatMessage();
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
    const route = `/${buildGetItemChatRoute(itemId)}`;
    const key = buildItemChatKey(itemId);

    it(`getUpdates = true`, async () => {
      const hook = () => hooks.useItemChat(itemId, { getUpdates: true });
      const defaultItemChatMessageValues = {
        id: itemId,
        messages: buildChatMessages(itemId),
      };
      const createMockItemChatMessage: Record.Factory<any> = Record(
        defaultItemChatMessageValues,
      );
      const response: RecordOf<any> = createMockItemChatMessage();
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
      const defaultItemChatMessageValues = {
        id: itemId,
        messages: buildChatMessages(itemId),
      };
      const createMockItemChatMessage: Record.Factory<any> = Record(
        defaultItemChatMessageValues,
      );
      const response: RecordOf<any> = createMockItemChatMessage();
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
      const defaultExportedItemChatMessageValues: ExportedItemChat = {
        id: itemId,
        messages: buildExportedChat(itemId),
      };
      const createMockExportedItemChatMessage: Record.Factory<ExportedItemChat> =
        Record(defaultExportedItemChatMessageValues);
      const response: ExportedItemChatRecord =
        createMockExportedItemChatMessage();
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

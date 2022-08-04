/* eslint-disable import/no-extraneous-dependencies */
import nock from 'nock';
import { StatusCodes } from 'http-status-codes';
import { Record } from 'immutable';
import Cookies from 'js-cookie';
import { buildGetItemChatRoute } from '../api/routes';
import { mockHook, setUpTest } from '../../test/utils';
import {
  buildChatMessages,
  ITEMS,
  UNAUTHORIZED_RESPONSE,
} from '../../test/constants';
import { buildItemChatKey } from '../config/keys';
import type { ItemChat, ItemChatRecord } from '../types';

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
      const endpoints = [{ route, response }];
      const { data } = await mockHook({ endpoints, hook, wrapper });

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
});

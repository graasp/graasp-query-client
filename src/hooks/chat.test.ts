/* eslint-disable import/no-extraneous-dependencies */
import nock from 'nock';
import { StatusCodes } from 'http-status-codes';
import { List, Map } from 'immutable';
import Cookies from 'js-cookie';
import { buildGetItemChatRoute } from '../api/routes';
import { mockHook, setUpTest } from '../../test/utils';
import {
  buildChatMessages,
  ITEMS,
  UNAUTHORIZED_RESPONSE,
} from '../../test/constants';
import { buildItemChatKey } from '../config/keys';
import type { ChatMessage } from '../types';

const { hooks, wrapper, queryClient } = setUpTest();

jest.spyOn(Cookies, 'get').mockReturnValue({ session: 'somesession' });

describe('Chat Hooks', () => {
  afterEach(() => {
    nock.cleanAll();
    queryClient.clear();
  });

  describe('useItemChat', () => {
    const itemId = ITEMS[0].id;
    const route = `/${buildGetItemChatRoute(itemId)}`;
    const key = buildItemChatKey(itemId);

    const hook = () => hooks.useItemChat(itemId);

    it(`Receive chat messages`, async () => {
      const response = { id: itemId, messages: buildChatMessages(itemId) };
      const endpoints = [{ route, response }];
      const { data } = await mockHook({ endpoints, hook, wrapper });

      expect((data as List<ChatMessage>).toJS()).toEqual(response);

      // verify cache keys
      expect(queryClient.getQueryData(key)).toEqual(Map(response));
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

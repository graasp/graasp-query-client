import { ChatMessage, FolderItemFactory } from '@graasp/sdk';

import { afterEach, describe, expect, it } from 'vitest';

import { CHAT_MESSAGES } from '../../../test/constants.js';
import {
  getHandlerByChannel,
  mockWsHook,
  setUpWsTest,
} from '../../../test/wsUtils.js';
import { buildItemChatKey } from '../../keys.js';
import { KINDS, OPS, TOPICS } from '../constants.js';
import { configureWsChatHooks } from './chat.js';

const { hooks, wrapper, queryClient, handlers } = setUpWsTest({
  configureWsHooks: configureWsChatHooks,
});

describe('Ws Chat Hooks', () => {
  afterEach(() => {
    queryClient.clear();
  });

  describe('useItemChatUpdates incorrect use', () => {
    const chatId = '';
    const incorrectHook = () => hooks.useItemChatUpdates(chatId);
    const chatKey = buildItemChatKey(chatId);
    const channel = {
      name: chatId,
      topic: TOPICS.CHAT_ITEM,
    };

    it('Does nothing', async () => {
      queryClient.setQueryData(chatKey, CHAT_MESSAGES);
      await mockWsHook({
        hook: incorrectHook,
        wrapper,
      });

      const chatEvent = {
        kind: KINDS.ITEM,
        op: OPS.PUBLISH,
        message: 'new Message',
      };

      getHandlerByChannel(handlers, channel)?.handler(chatEvent);

      // expect no change
      expect(queryClient.getQueryData(chatKey)).toEqual(CHAT_MESSAGES);
    });
  });

  describe('useItemChatUpdates', () => {
    const itemId = FolderItemFactory().id;
    const chatId = itemId;
    const chatKey = buildItemChatKey(chatId);
    const messages = CHAT_MESSAGES;
    const newMessage = { body: 'new content message' };
    const channel = {
      name: chatId,
      topic: TOPICS.CHAT_ITEM,
    };
    const hook = () => hooks.useItemChatUpdates(itemId);

    it(`Receive chat messages update`, async () => {
      queryClient.setQueryData(chatKey, CHAT_MESSAGES);
      await mockWsHook({
        hook,
        wrapper,
      });

      const chatEvent = {
        kind: KINDS.ITEM,
        op: OPS.PUBLISH,
        message: newMessage,
      };

      getHandlerByChannel(handlers, channel)?.handler(chatEvent);

      expect(queryClient.getQueryData(chatKey)).toContainEqual(newMessage);
    });

    it(`Receive chat messages edit update`, async () => {
      const updatedMessage = {
        id: messages[0].id,
        body: 'new message content',
      };
      queryClient.setQueryData(chatKey, messages);
      await mockWsHook({
        hook,
        wrapper,
      });

      const chatEvent = {
        kind: KINDS.ITEM,
        op: OPS.UPDATE,
        message: updatedMessage,
      };

      getHandlerByChannel(handlers, channel)?.handler(chatEvent);
      expect(queryClient.getQueryData(chatKey)).toContainEqual(updatedMessage);
    });

    it(`Receive chat messages delete update`, async () => {
      const deletedMessage = { id: messages[0].id };
      queryClient.setQueryData(chatKey, CHAT_MESSAGES);
      await mockWsHook({
        hook,
        wrapper,
      });

      const chatEvent = {
        kind: KINDS.ITEM,
        op: OPS.DELETE,
        message: deletedMessage,
      };

      getHandlerByChannel(handlers, channel)?.handler(chatEvent);
      const m = queryClient.getQueryData(chatKey);
      expect(m).toHaveLength(1);
      expect(m).not.toContainEqual(CHAT_MESSAGES[0]);
    });

    it(`Receive chat messages clear update`, async () => {
      queryClient.setQueryData(chatKey, CHAT_MESSAGES);
      await mockWsHook({
        hook,
        wrapper,
      });

      const chatEvent = {
        kind: KINDS.ITEM,
        op: OPS.CLEAR,
      };

      getHandlerByChannel(handlers, channel)?.handler(chatEvent);

      expect(queryClient.getQueryData(chatKey)).toEqual([]);
    });

    it(`Does not update chat messages with wrong chat event`, async () => {
      queryClient.setQueryData(chatKey, CHAT_MESSAGES);
      await mockWsHook({
        hook,
        wrapper,
      });

      const chatEvent = {
        kind: 'false kind',
        op: OPS.PUBLISH,
        message: newMessage,
      };

      getHandlerByChannel(handlers, channel)?.handler(chatEvent);

      expect(
        queryClient
          .getQueryData<ChatMessage[]>(chatKey)
          ?.find(({ body }: { body: string }) => body === newMessage.body),
      ).toBeFalsy();
    });

    it(`Does not update chat messages with wrong OP event`, async () => {
      queryClient.setQueryData(chatKey, CHAT_MESSAGES);
      await mockWsHook({
        hook,
        wrapper,
      });

      const chatEvent = {
        kind: KINDS.ITEM,
        op: 'unset OP',
        message: newMessage,
      };

      getHandlerByChannel(handlers, channel)?.handler(chatEvent);
      expect(
        queryClient
          .getQueryData<ChatMessage[]>(chatKey)
          ?.find(({ body }: { body: string }) => body === newMessage.body),
      ).toBeFalsy();
    });
  });
});

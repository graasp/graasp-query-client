import { RecordOf } from 'immutable';
import {
  getHandlerByChannel,
  mockWsHook,
  setUpWsTest,
} from '../../../test/wsUtils';
import { ITEMS, ITEM_CHAT, MESSAGE_IDS } from '../../../test/constants';
import { buildItemChatKey } from '../../config/keys';
import { configureWsChatHooks } from './chat';
import { KINDS, OPS, TOPICS } from '../constants';
import { Chat } from '../../types';

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
      queryClient.setQueryData(chatKey, ITEM_CHAT);
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
      expect(
        queryClient.getQueryData<RecordOf<Chat>>(chatKey)?.messages.toJS(),
      ).toEqual(ITEM_CHAT.messages.toJS());
    });
  });

  describe('useItemChatUpdates', () => {
    const itemId = ITEMS.first()!.id;
    const chatId = itemId;
    const chatKey = buildItemChatKey(chatId);
    const newMessage = { body: 'new content message' };
    const channel = {
      name: chatId,
      topic: TOPICS.CHAT_ITEM,
    };
    const hook = () => hooks.useItemChatUpdates(itemId);

    it(`Receive chat messages update`, async () => {
      queryClient.setQueryData(chatKey, ITEM_CHAT);
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

      expect(
        queryClient.getQueryData<RecordOf<Chat>>(chatKey)?.messages.toJS(),
      ).toContainEqual(newMessage);
    });

    it(`Receive chat messages edit update`, async () => {
      const updatedMessage = {
        id: MESSAGE_IDS[0],
        body: 'new message content',
      };
      queryClient.setQueryData(chatKey, ITEM_CHAT);
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

      expect(
        queryClient.getQueryData<RecordOf<Chat>>(chatKey)?.messages.toJS(),
      ).toContainEqual(updatedMessage);
    });

    it(`Receive chat messages delete update`, async () => {
      const deletedMessage = { id: MESSAGE_IDS[0] };
      queryClient.setQueryData(chatKey, ITEM_CHAT);
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

      expect(
        queryClient.getQueryData<RecordOf<Chat>>(chatKey)?.messages.toJS(),
      ).not.toContainEqual(ITEM_CHAT.messages.first()!.toJS());
    });

    it(`Receive chat messages clear update`, async () => {
      queryClient.setQueryData(chatKey, ITEM_CHAT);
      await mockWsHook({
        hook,
        wrapper,
      });

      const chatEvent = {
        kind: KINDS.ITEM,
        op: OPS.CLEAR,
      };

      getHandlerByChannel(handlers, channel)?.handler(chatEvent);

      expect(
        queryClient.getQueryData<RecordOf<Chat>>(chatKey)?.messages.toJS(),
      ).toEqual([]);
    });

    it(`Does not update chat messages with wrong chat event`, async () => {
      queryClient.setQueryData(chatKey, ITEM_CHAT);
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
          .getQueryData<RecordOf<Chat>>(chatKey)
          ?.messages.find(({ body }) => body === newMessage.body),
      ).toBeFalsy();
    });

    it(`Does not update chat messages with wrong OP event`, async () => {
      queryClient.setQueryData(chatKey, ITEM_CHAT);
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
          .getQueryData<RecordOf<Chat>>(chatKey)
          ?.messages.find(({ body }) => body === newMessage.body),
      ).toBeFalsy();
    });
  });
});

import { Map, Record } from 'immutable';
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

  describe('useItemChatUpdates', () => {
    const itemId = ITEMS[0].id;
    const chatId = itemId;
    const chatKey = buildItemChatKey(chatId);
    const newMessage = { body: 'new content message' };
    const channel = { name: chatId, topic: TOPICS.CHAT_ITEM };
    const hook = () => hooks.useItemChatUpdates(itemId);

    it(`Receive chat messages update`, async () => {
      queryClient.setQueryData(chatKey, Map(ITEM_CHAT));
      await mockWsHook({ hook, wrapper });

      const chatEvent = {
        kind: KINDS.ITEM,
        op: OPS.PUBLISH,
        message: newMessage,
      };

      getHandlerByChannel(handlers, channel)?.handler(chatEvent);

      expect(
        queryClient.getQueryData<Record<Chat>>(chatKey)?.get('messages'),
      ).toContainEqual(newMessage);
    });

    it(`Receive chat messages edit update`, async () => {
      const updatedMessage = { id: MESSAGE_IDS[0], body: 'new message content' }
      queryClient.setQueryData(chatKey, Map(ITEM_CHAT));
      await mockWsHook({ hook, wrapper });

      const chatEvent = {
        kind: KINDS.ITEM,
        op: OPS.UPDATE,
        message: updatedMessage,
      };

      getHandlerByChannel(handlers, channel)?.handler(chatEvent);

      expect(
        queryClient.getQueryData<Record<Chat>>(chatKey)?.get('messages'),
      ).toContainEqual(updatedMessage);
    });

    it(`Receive chat messages delete update`, async () => {
      const deletedMessage = { id: MESSAGE_IDS[0] };
      queryClient.setQueryData(chatKey, Map(ITEM_CHAT));
      await mockWsHook({ hook, wrapper });

      const chatEvent = {
        kind: KINDS.ITEM,
        op: OPS.DELETE,
        message: deletedMessage,
      };

      getHandlerByChannel(handlers, channel)?.handler(chatEvent);

      expect(
        queryClient.getQueryData<Record<Chat>>(chatKey)?.get('messages'),
      ).not.toContainEqual(ITEM_CHAT.messages[0]);
    });

    it(`Does not update chat messages with wrong chat event`, async () => {
      queryClient.setQueryData(chatKey, Map(ITEM_CHAT));
      await mockWsHook({ hook, wrapper });

      const chatEvent = {
        kind: 'false kind',
        op: OPS.PUBLISH,
        message: newMessage,
      };

      getHandlerByChannel(handlers, channel)?.handler(chatEvent);

      expect(
        queryClient
          .getQueryData<Record<Chat>>(chatKey)
          ?.get('messages')
          .find(({ body }) => body === newMessage.body),
      ).toBeFalsy();
    });
  });
});

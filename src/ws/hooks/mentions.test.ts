import { AccountFactory, ChatMention, MentionStatus } from '@graasp/sdk';

import { afterEach, describe, expect, it } from 'vitest';

import {
  buildChatMention,
  buildMemberMentions,
} from '../../../test/constants.js';
import {
  getHandlerByChannel,
  mockWsHook,
  setUpWsTest,
} from '../../../test/wsUtils.js';
import { buildItemChatKey, buildMentionKey } from '../../keys.js';
import { OPS, TOPICS } from '../constants.js';
import { configureWsChatMentionsHooks } from './mentions.js';

const { hooks, wrapper, queryClient, handlers } = setUpWsTest({
  configureWsHooks: configureWsChatMentionsHooks,
});

describe('Ws Mention Hooks', () => {
  afterEach(() => {
    queryClient.clear();
  });

  describe('useMentionsUpdates incorrect use', () => {
    const memberId = '';
    const incorrectHook = () => hooks.useMentionsUpdates(memberId);
    const mentionKey = buildMentionKey();
    const channel = {
      name: memberId,
      topic: TOPICS.CHAT_ITEM,
    };
    const MENTIONS_QUERY_DATA = buildMemberMentions();

    it('Does nothing', async () => {
      queryClient.setQueryData(mentionKey, MENTIONS_QUERY_DATA);
      await mockWsHook({
        hook: incorrectHook,
        wrapper,
      });
      const newMention = buildChatMention({});
      const mentionEvent = {
        op: OPS.PUBLISH,
        mention: newMention,
      };

      getHandlerByChannel(handlers, channel)?.handler(mentionEvent);

      // expect no change
      expect(queryClient.getQueryData<ChatMention[]>(mentionKey)).toEqual(
        MENTIONS_QUERY_DATA,
      );
    });
  });

  describe('useMentionsUpdates', () => {
    const account = AccountFactory();
    const chatKey = buildItemChatKey(account.id);
    const mentionKey = buildMentionKey();
    const channel = {
      name: account.id,
      topic: TOPICS.MENTIONS,
    };
    const MENTIONS_QUERY_DATA = buildMemberMentions();
    const hook = () => hooks.useMentionsUpdates(account.id);

    it(`Receive mention update`, async () => {
      queryClient.setQueryData(mentionKey, MENTIONS_QUERY_DATA);
      await mockWsHook({
        hook,
        wrapper,
      });

      const newMention = buildChatMention({ account });
      const mentionEvent = {
        op: OPS.PUBLISH,
        mention: newMention,
      };

      getHandlerByChannel(handlers, channel)?.handler(mentionEvent);

      expect(
        queryClient
          .getQueryData<ChatMention[]>(mentionKey)
          ?.find(({ id }: { id: string }) => id === newMention.id),
      ).toMatchObject(newMention);
    });

    it(`Receive mention edit update`, async () => {
      const updatedMention = {
        ...MENTIONS_QUERY_DATA[0],
        status: MentionStatus.Read,
      };
      queryClient.setQueryData(mentionKey, MENTIONS_QUERY_DATA);
      await mockWsHook({
        hook,
        wrapper,
      });

      const mentionEvent = {
        op: OPS.UPDATE,
        mention: updatedMention,
      };

      getHandlerByChannel(handlers, channel)?.handler(mentionEvent);

      expect(
        queryClient.getQueryData<ChatMention[]>(mentionKey),
      ).toContainEqual(updatedMention);
    });

    it(`Receive mention delete update`, async () => {
      const deletedMention = MENTIONS_QUERY_DATA[0];
      queryClient.setQueryData(mentionKey, MENTIONS_QUERY_DATA);
      await mockWsHook({
        hook,
        wrapper,
      });

      const mentionEvent = {
        op: OPS.DELETE,
        mention: deletedMention,
      };

      getHandlerByChannel(handlers, channel)?.handler(mentionEvent);

      expect(queryClient.getQueryData(mentionKey)).toEqual(
        MENTIONS_QUERY_DATA.filter(({ id }) => id !== deletedMention.id),
      );
    });

    it(`Receive member mentions clear update`, async () => {
      queryClient.setQueryData(mentionKey, MENTIONS_QUERY_DATA);
      await mockWsHook({
        hook,
        wrapper,
      });

      const mentionEvent = {
        op: OPS.CLEAR,
      };

      getHandlerByChannel(handlers, channel)?.handler(mentionEvent);

      expect(queryClient.getQueryData<ChatMention[]>(mentionKey)).toEqual([]);
    });

    it(`Does not update mentions with wrong OP event`, async () => {
      queryClient.setQueryData(mentionKey, MENTIONS_QUERY_DATA);
      await mockWsHook({
        hook,
        wrapper,
      });
      const newMention = buildChatMention({ account: AccountFactory() });
      const mentionEvent = {
        op: 'unset op',
        mention: newMention,
      };

      getHandlerByChannel(handlers, channel)?.handler(mentionEvent);

      expect(
        queryClient
          .getQueryData<ChatMention[]>(chatKey)
          ?.find(({ id }: { id: string }) => id === newMention.id),
      ).toBeFalsy();
    });
  });
});

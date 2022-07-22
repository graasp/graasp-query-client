import { Map, Record } from 'immutable';
import {
  getHandlerByChannel,
  mockWsHook,
  setUpWsTest,
} from '../../../test/wsUtils';
import {
  buildMemberMentions,
  buildChatMention,
  MEMBER_RESPONSE,
} from '../../../test/constants';
import { buildItemChatKey, buildMentionKey } from '../../config/keys';
import { OPS, TOPICS } from '../constants';
import { MemberMentions } from '../../types';
import { configureWsChatMentionsHooks } from './mentions';

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
    const mentionKey = buildMentionKey(memberId);
    const channel = {
      name: memberId,
      topic: TOPICS.CHAT_ITEM,
    };
    const MENTIONS_QUERY_DATA = buildMemberMentions(memberId);

    it('Does nothing', async () => {
      queryClient.setQueryData(mentionKey, Map(MENTIONS_QUERY_DATA));
      await mockWsHook({
        hook: incorrectHook,
        wrapper,
      });
      const newMention = buildChatMention({ memberId });
      const mentionEvent = {
        op: OPS.PUBLISH,
        mention: newMention,
      };

      getHandlerByChannel(handlers, channel)?.handler(mentionEvent);

      // expect no change
      expect(
        queryClient
          .getQueryData<Record<MemberMentions>>(mentionKey)
          ?.get('mentions'),
      ).toEqual(MENTIONS_QUERY_DATA.mentions);
    });
  });

  describe('useMentionsUpdates', () => {
    const memberId = MEMBER_RESPONSE.id;
    const chatKey = buildItemChatKey(memberId);
    const mentionKey = buildMentionKey(memberId);
    const channel = {
      name: memberId,
      topic: TOPICS.MENTIONS,
    };
    const MENTIONS_QUERY_DATA = buildMemberMentions(memberId);
    const hook = () => hooks.useMentionsUpdates(memberId);

    it(`Receive mention update`, async () => {
      queryClient.setQueryData(mentionKey, Map(MENTIONS_QUERY_DATA));
      await mockWsHook({
        hook,
        wrapper,
      });

      const newMention = buildChatMention({ memberId });
      const mentionEvent = {
        op: OPS.PUBLISH,
        mention: newMention,
      };

      getHandlerByChannel(handlers, channel)?.handler(mentionEvent);

      expect(
        queryClient
          .getQueryData<Record<MemberMentions>>(mentionKey)
          ?.get('mentions'),
      ).toContainEqual(newMention);
    });

    it(`Receive mention edit update`, async () => {
      const updatedMention = {
        ...MENTIONS_QUERY_DATA.mentions[0],
        status: 'read',
      };
      queryClient.setQueryData(mentionKey, Map(MENTIONS_QUERY_DATA));
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
        queryClient
          .getQueryData<Record<MemberMentions>>(mentionKey)
          ?.get('mentions'),
      ).toContainEqual(updatedMention);
    });

    it(`Receive mention delete update`, async () => {
      const deletedMention = MENTIONS_QUERY_DATA.mentions[0];
      queryClient.setQueryData(mentionKey, Map(MENTIONS_QUERY_DATA));
      await mockWsHook({
        hook,
        wrapper,
      });

      const mentionEvent = {
        op: OPS.DELETE,
        mention: deletedMention,
      };

      getHandlerByChannel(handlers, channel)?.handler(mentionEvent);

      expect(
        queryClient
          .getQueryData<Record<MemberMentions>>(mentionKey)
          ?.get('mentions'),
      ).not.toContainEqual(deletedMention);
    });

    it(`Receive member mentions clear update`, async () => {
      queryClient.setQueryData(mentionKey, Map(MENTIONS_QUERY_DATA));
      await mockWsHook({
        hook,
        wrapper,
      });

      const mentionEvent = {
        op: OPS.CLEAR,
      };

      getHandlerByChannel(handlers, channel)?.handler(mentionEvent);

      expect(
        queryClient
          .getQueryData<Record<MemberMentions>>(mentionKey)
          ?.get('mentions'),
      ).toEqual([]);
    });

    it(`Does not update mentions with wrong OP event`, async () => {
      queryClient.setQueryData(mentionKey, Map(MENTIONS_QUERY_DATA));
      await mockWsHook({
        hook,
        wrapper,
      });
      const newMention = buildChatMention({ memberId });
      const mentionEvent = {
        op: 'unset op',
        mention: newMention,
      };

      getHandlerByChannel(handlers, channel)?.handler(mentionEvent);

      expect(
        queryClient
          .getQueryData<Record<MemberMentions>>(chatKey)
          ?.get('mentions')
          .find(({ id }) => id === newMention.id),
      ).toBeFalsy();
    });
  });
});

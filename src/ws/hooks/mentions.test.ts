import { List } from 'immutable';

import { Member, MentionStatus } from '@graasp/sdk';
import { ChatMentionRecord } from '@graasp/sdk/frontend';

import {
  MEMBER_RESPONSE,
  MOCK_MEMBER,
  buildChatMention,
  buildMemberMentions,
} from '../../../test/constants';
import {
  getHandlerByChannel,
  mockWsHook,
  setUpWsTest,
} from '../../../test/wsUtils';
import { buildItemChatKey, buildMentionKey } from '../../config/keys';
import { OPS, TOPICS } from '../constants';
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
        mention: newMention.toJS(),
      };

      getHandlerByChannel(handlers, channel)?.handler(mentionEvent);

      // expect no change
      expect(
        queryClient.getQueryData<List<ChatMentionRecord>>(mentionKey),
      ).toEqualImmutable(MENTIONS_QUERY_DATA);
    });
  });

  describe('useMentionsUpdates', () => {
    const member = MEMBER_RESPONSE.toJS() as Member;
    const chatKey = buildItemChatKey(member.id);
    const mentionKey = buildMentionKey(member.id);
    const channel = {
      name: member.id,
      topic: TOPICS.MENTIONS,
    };
    const MENTIONS_QUERY_DATA = buildMemberMentions();
    const hook = () => hooks.useMentionsUpdates(member.id);

    it(`Receive mention update`, async () => {
      queryClient.setQueryData(mentionKey, MENTIONS_QUERY_DATA);
      await mockWsHook({
        hook,
        wrapper,
      });

      const newMention = buildChatMention({ member });
      const mentionEvent = {
        op: OPS.PUBLISH,
        mention: newMention.toJS(),
      };

      getHandlerByChannel(handlers, channel)?.handler(mentionEvent);

      expect(
        queryClient
          .getQueryData<List<ChatMentionRecord>>(mentionKey)
          ?.find(({ id }: { id: string }) => id === newMention.id),
      ).toEqualImmutable(newMention);
    });

    it(`Receive mention edit update`, async () => {
      const updatedMention = {
        ...MENTIONS_QUERY_DATA.first()!.toJS(),
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
        queryClient.getQueryData<List<ChatMentionRecord>>(mentionKey)?.toJS(),
      ).toContainEqual(updatedMention);
    });

    it(`Receive mention delete update`, async () => {
      const deletedMention = MENTIONS_QUERY_DATA.first()!;
      queryClient.setQueryData(mentionKey, MENTIONS_QUERY_DATA);
      await mockWsHook({
        hook,
        wrapper,
      });

      const mentionEvent = {
        op: OPS.DELETE,
        mention: deletedMention.toJS(),
      };

      getHandlerByChannel(handlers, channel)?.handler(mentionEvent);

      expect(
        queryClient.getQueryData<List<ChatMentionRecord>>(mentionKey),
      ).toEqualImmutable(
        MENTIONS_QUERY_DATA.filter(
          ({ id }: { id: string }) => id !== deletedMention.id,
        ),
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

      expect(
        queryClient.getQueryData<List<ChatMentionRecord>>(mentionKey),
      ).toEqual(List([]));
    });

    it(`Does not update mentions with wrong OP event`, async () => {
      queryClient.setQueryData(mentionKey, MENTIONS_QUERY_DATA);
      await mockWsHook({
        hook,
        wrapper,
      });
      const newMention = buildChatMention({ member: MOCK_MEMBER });
      const mentionEvent = {
        op: 'unset op',
        mention: newMention.toJS(),
      };

      getHandlerByChannel(handlers, channel)?.handler(mentionEvent);

      expect(
        queryClient
          .getQueryData<List<ChatMentionRecord>>(chatKey)
          ?.find(({ id }: { id: string }) => id === newMention.id),
      ).toBeFalsy();
    });
  });
});

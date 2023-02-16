import { List } from 'immutable';

import { MentionStatus } from '@graasp/sdk';
import { MemberMentionsRecord } from '@graasp/sdk/frontend';

import {
  MEMBER_RESPONSE,
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
    const MENTIONS_QUERY_DATA = buildMemberMentions(memberId);

    it('Does nothing', async () => {
      queryClient.setQueryData(mentionKey, MENTIONS_QUERY_DATA);
      await mockWsHook({
        hook: incorrectHook,
        wrapper,
      });
      const newMention = buildChatMention({ memberId });
      const mentionEvent = {
        op: OPS.PUBLISH,
        mention: newMention.toJS(),
      };

      getHandlerByChannel(handlers, channel)?.handler(mentionEvent);

      // expect no change
      expect(
        queryClient.getQueryData<MemberMentionsRecord>(mentionKey)?.mentions,
      ).toEqualImmutable(MENTIONS_QUERY_DATA.mentions);
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
      queryClient.setQueryData(mentionKey, MENTIONS_QUERY_DATA);
      await mockWsHook({
        hook,
        wrapper,
      });

      const newMention = buildChatMention({ memberId });
      const mentionEvent = {
        op: OPS.PUBLISH,
        mention: newMention.toJS(),
      };

      getHandlerByChannel(handlers, channel)?.handler(mentionEvent);

      expect(
        queryClient
          .getQueryData<MemberMentionsRecord>(mentionKey)
          ?.mentions.find(({ id }: { id: string }) => id === newMention.id),
      ).toEqualImmutable(newMention);
    });

    it(`Receive mention edit update`, async () => {
      const updatedMention = {
        ...MENTIONS_QUERY_DATA.mentions.first()!.toJS(),
        status: MentionStatus.READ,
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
        queryClient
          .getQueryData<MemberMentionsRecord>(mentionKey)
          ?.mentions.toJS(),
      ).toContainEqual(updatedMention);
    });

    it(`Receive mention delete update`, async () => {
      const deletedMention = MENTIONS_QUERY_DATA.mentions.first()!;
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
        queryClient.getQueryData<MemberMentionsRecord>(mentionKey)?.mentions,
      ).toEqualImmutable(
        MENTIONS_QUERY_DATA.mentions.filter(
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
        queryClient.getQueryData<MemberMentionsRecord>(mentionKey)?.mentions,
      ).toEqual(List([]));
    });

    it(`Does not update mentions with wrong OP event`, async () => {
      queryClient.setQueryData(mentionKey, MENTIONS_QUERY_DATA);
      await mockWsHook({
        hook,
        wrapper,
      });
      const newMention = buildChatMention({ memberId });
      const mentionEvent = {
        op: 'unset op',
        mention: newMention.toJS(),
      };

      getHandlerByChannel(handlers, channel)?.handler(mentionEvent);

      expect(
        queryClient
          .getQueryData<MemberMentionsRecord>(chatKey)
          ?.mentions.find(({ id }: { id: string }) => id === newMention.id),
      ).toBeFalsy();
    });
  });
});

/* eslint-disable import/no-extraneous-dependencies */
import nock from 'nock';
import { RecordOf } from 'immutable';
import Cookies from 'js-cookie';
import {
  buildGetMemberMentionsRoute,
  GET_CURRENT_MEMBER_ROUTE,
} from '../api/routes';
import { mockHook, setUpTest } from '../../test/utils';
import { buildChatMentions, MEMBER_RESPONSE } from '../../test/constants';
import { buildMentionKey } from '../config/keys';
import type { MemberMentions } from '../types';
import { MemberMentionsRecord } from '../types';

const { hooks, wrapper, queryClient } = setUpTest();

jest.spyOn(Cookies, 'get').mockReturnValue({ session: 'somesession' });

describe('Chat Mention Hooks', () => {
  afterEach(() => {
    nock.cleanAll();
    queryClient.clear();
  });

  describe('useMentions', () => {
    const memberId = MEMBER_RESPONSE.id;
    const currentMemberRoute = `/${GET_CURRENT_MEMBER_ROUTE}`;
    const route = `/${buildGetMemberMentionsRoute()}`;
    const key = buildMentionKey(memberId);

    const hook = () => hooks.useMentions();

    it(`Receive member mentions`, async () => {
      const response = {
        memberId: memberId,
        mentions: buildChatMentions(memberId),
      };
      const endpoints = [
        {
          route: currentMemberRoute,
          response: MEMBER_RESPONSE,
        },
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

      expect((data as RecordOf<MemberMentions>).toJS()).toEqual(response);

      // verify cache keys
      expect(queryClient.getQueryData(key)).toEqual(
        MemberMentionsRecord(response),
      );
    });
  });
});

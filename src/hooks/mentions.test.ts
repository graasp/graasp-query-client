/* eslint-disable import/no-extraneous-dependencies */
import Cookies from 'js-cookie';
import nock from 'nock';

import { MEMBER_RESPONSE, buildMemberMentions } from '../../test/constants';
import { mockHook, setUpTest } from '../../test/utils';
import {
  GET_CURRENT_MEMBER_ROUTE,
  buildGetMemberMentionsRoute,
} from '../api/routes';
import { CURRENT_MEMBER_KEY, buildMentionKey } from '../config/keys';
import type { MemberMentionsRecord } from '../types';

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
      // set current member
      queryClient.setQueryData(CURRENT_MEMBER_KEY, MEMBER_RESPONSE);
      const response = buildMemberMentions(memberId);
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

      expect(data as MemberMentionsRecord).toEqualImmutable(response);

      // verify cache keys
      expect(queryClient.getQueryData(key)).toEqualImmutable(response);
    });
  });
});

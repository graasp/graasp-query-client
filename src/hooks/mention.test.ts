/* eslint-disable import/no-extraneous-dependencies */
import { List } from 'immutable';
import Cookies from 'js-cookie';
import nock from 'nock';

import { ChatMentionRecord } from '@graasp/sdk/frontend';

import { MEMBER_RESPONSE, buildMemberMentions } from '../../test/constants';
import { mockHook, setUpTest } from '../../test/utils';
import {
  GET_CURRENT_MEMBER_ROUTE,
  buildGetMemberMentionsRoute,
} from '../api/routes';
import { buildMentionKey } from '../config/keys';

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

      expect(data as List<ChatMentionRecord>).toEqualImmutable(response);

      // verify cache keys
      expect(queryClient.getQueryData(key)).toEqualImmutable(response);
    });
  });
});

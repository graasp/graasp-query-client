/* eslint-disable import/no-extraneous-dependencies */
import Cookies from 'js-cookie';
import nock from 'nock';

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
    const currentMemberRoute = `/${GET_CURRENT_MEMBER_ROUTE}`;
    const route = `/${buildGetMemberMentionsRoute()}`;
    const key = buildMentionKey();

    const hook = () => hooks.useMentions();

    it(`Receive member mentions`, async () => {
      const response = buildMemberMentions();
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

      expect(data).toMatchObject(response);

      // verify cache keys
      expect(queryClient.getQueryData(key)).toMatchObject(response);
    });
  });
});

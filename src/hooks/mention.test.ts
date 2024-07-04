import { MemberFactory } from '@graasp/sdk';

import nock from 'nock';
import { afterEach, describe, expect, it } from 'vitest';

import { buildMemberMentions } from '../../test/constants.js';
import { mockHook, setUpTest } from '../../test/utils.js';
import { buildMentionKey } from '../keys.js';
import { buildGetCurrentMemberRoute } from '../member/routes.js';
import { buildGetMemberMentionsRoute } from '../routes.js';

const { hooks, wrapper, queryClient } = setUpTest();

describe('Chat Mention Hooks', () => {
  afterEach(() => {
    nock.cleanAll();
    queryClient.clear();
  });

  describe('useMentions', () => {
    const currentMemberRoute = `/${buildGetCurrentMemberRoute()}`;
    const route = `/${buildGetMemberMentionsRoute()}`;
    const key = buildMentionKey();

    const hook = () => hooks.useMentions();

    it(`Receive member mentions`, async () => {
      const response = buildMemberMentions();
      const endpoints = [
        {
          route: currentMemberRoute,
          response: MemberFactory(),
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

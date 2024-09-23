import {
  CompleteMembershipRequest,
  MemberFactory,
  MembershipRequestStatus,
  PackedFolderItemFactory,
} from '@graasp/sdk';

import nock from 'nock';
import { afterEach, describe, expect, it } from 'vitest';

import { mockHook, setUpTest } from '../../../test/utils.js';
import { membershipRequestsKeys } from './keys.js';
import {
  buildGetOwnMembershipRequestRoute,
  buildRequestMembershipRoute,
} from './routes.js';

const { hooks, wrapper, queryClient } = setUpTest();

const item = PackedFolderItemFactory();
const itemId = item.id;

describe('Action Hooks', () => {
  afterEach(() => {
    nock.cleanAll();
    queryClient.clear();
  });

  describe('useOwnMembershipRequest', () => {
    const hook = () => hooks.useOwnMembershipRequest(itemId);
    const route = `/${buildGetOwnMembershipRequestRoute(itemId)}`;

    it(`Return own membership request`, async () => {
      const response = {
        status: MembershipRequestStatus.Approved,
      };
      const endpoints = [
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
      expect(
        queryClient.getQueryData(membershipRequestsKeys.own(itemId)),
      ).toMatchObject(response);
    });
  });

  describe('useMembershipRequests', () => {
    const hook = () => hooks.useMembershipRequests(itemId);
    const route = `/${buildRequestMembershipRoute(itemId)}`;

    it(`Return own membership request`, async () => {
      const response: CompleteMembershipRequest[] = [
        {
          item,
          createdAt: new Date().toISOString(),
          member: MemberFactory(),
        },
      ];
      const endpoints = [
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
      expect(
        queryClient.getQueryData(membershipRequestsKeys.single(itemId)),
      ).toMatchObject(response);
    });
  });
});

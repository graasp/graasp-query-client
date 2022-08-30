/* eslint-disable import/no-extraneous-dependencies */
import { StatusCodes } from 'http-status-codes';
import { List } from 'immutable';
import Cookies from 'js-cookie';
import nock from 'nock';

import {
  ITEMS,
  UNAUTHORIZED_RESPONSE,
  buildInvitationRecord,
} from '../../test/constants';
import { mockHook, setUpTest } from '../../test/utils';
import {
  buildGetInvitationRoute,
  buildGetItemInvitationsForItemRoute,
} from '../api/routes';
import { buildInvitationKey, buildItemInvitationsKey } from '../config/keys';
import { InvitationRecord } from '../types';

const { hooks, wrapper, queryClient } = setUpTest();
const itemPath = ITEMS.first()!.path;

jest.spyOn(Cookies, 'get').mockReturnValue({ session: 'somesession' });

describe('Invitation Hooks', () => {
  afterEach(() => {
    nock.cleanAll();
    queryClient.clear();
  });

  describe('useInvitation', () => {
    const invId = 'invitation-id';
    const route = `/${buildGetInvitationRoute(invId)}`;
    const key = buildInvitationKey(invId);

    const hook = () => hooks.useInvitation(invId);

    it(`Receive invitation`, async () => {
      const response = buildInvitationRecord({ itemPath });
      const endpoints = [{ route, response }];
      const { data } = await mockHook({ endpoints, hook, wrapper });

      expect(data as InvitationRecord).toEqualImmutable(response);

      // verify cache keys
      expect(queryClient.getQueryData(key)).toEqualImmutable(response);
    });

    it(`Undefined id does not fetch`, async () => {
      const response = buildInvitationRecord({ itemPath });
      const endpoints = [{ route, response }];
      const { data, isFetched } = await mockHook({
        endpoints,
        hook,
        wrapper,
        enabled: false,
      });

      expect(isFetched).toBeFalsy();
      expect(data).toBeFalsy();

      // verify cache keys
      expect(queryClient.getQueryData(key)).toBeFalsy();
    });

    it(`Unauthorized`, async () => {
      const endpoints = [
        {
          route,
          response: UNAUTHORIZED_RESPONSE,
          statusCode: StatusCodes.UNAUTHORIZED,
        },
      ];
      const { data, isError } = await mockHook({
        hook,
        wrapper,
        endpoints,
      });

      expect(data).toBeFalsy();
      expect(isError).toBeTruthy();
      // verify cache keys
      expect(queryClient.getQueryData(key)).toBeFalsy();
    });
  });

  describe('useItemInvitations', () => {
    const itemId = ITEMS.first()!.id;
    const route = `/${buildGetItemInvitationsForItemRoute(itemId)}`;
    const key = buildItemInvitationsKey(itemId);

    const hook = () => hooks.useItemInvitations(itemId);

    it(`Receive invitations for item`, async () => {
      const response = List([
        buildInvitationRecord({ itemPath }),
        buildInvitationRecord({ itemPath }),
        buildInvitationRecord({ itemPath }),
      ]);
      const endpoints = [{ route, response }];
      const { data } = await mockHook({ endpoints, hook, wrapper });

      expect(data as List<InvitationRecord>).toEqualImmutable(response);

      // verify cache keys
      expect(queryClient.getQueryData(key)).toEqualImmutable(response);
    });

    it(`Undefined id does not fetch`, async () => {
      const response = buildInvitationRecord({ itemPath });
      const endpoints = [{ route, response }];
      const { data, isFetched } = await mockHook({
        endpoints,
        hook,
        wrapper,
        enabled: false,
      });

      expect(isFetched).toBeFalsy();
      expect(data).toBeFalsy();

      // verify cache keys
      expect(queryClient.getQueryData(key)).toBeFalsy();
    });

    it(`Unauthorized`, async () => {
      const endpoints = [
        {
          route,
          response: UNAUTHORIZED_RESPONSE,
          statusCode: StatusCodes.UNAUTHORIZED,
        },
      ];
      const { data, isError } = await mockHook({
        hook,
        wrapper,
        endpoints,
      });

      expect(data).toBeFalsy();
      expect(isError).toBeTruthy();
      // verify cache keys
      expect(queryClient.getQueryData(key)).toBeFalsy();
    });
  });
});

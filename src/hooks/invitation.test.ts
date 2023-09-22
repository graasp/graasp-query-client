/* eslint-disable import/no-extraneous-dependencies */
import { Item } from '@graasp/sdk';

import { StatusCodes } from 'http-status-codes';
import Immutable, { List } from 'immutable';
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

const { hooks, wrapper, queryClient } = setUpTest();
const item = ITEMS.first()!.toJS() as Item;

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
      const response = buildInvitationRecord({ item });
      const endpoints = [{ route, response }];
      const { data } = await mockHook({ endpoints, hook, wrapper });

      expect(Immutable.is(data, response)).toBeTruthy();

      // verify cache keys
      expect(
        Immutable.is(queryClient.getQueryData(key), response),
      ).toBeTruthy();
    });

    it(`Undefined id does not fetch`, async () => {
      const response = buildInvitationRecord({ item });
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
        buildInvitationRecord({ item }),
        buildInvitationRecord({ item }),
        buildInvitationRecord({ item }),
      ]);
      const endpoints = [{ route, response }];
      const { data } = await mockHook({ endpoints, hook, wrapper });

      expect(Immutable.is(data, response)).toBeTruthy();

      // verify cache keys
      expect(
        Immutable.is(queryClient.getQueryData(key), response),
      ).toBeTruthy();
    });

    it(`Undefined id does not fetch`, async () => {
      const response = buildInvitationRecord({ item });
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

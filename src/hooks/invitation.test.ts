/* eslint-disable import/no-extraneous-dependencies */
import nock from 'nock';
import { StatusCodes } from 'http-status-codes';
import { Map, List } from 'immutable';
import Cookies from 'js-cookie';
import {
  buildGetInvitationRoute,
  buildGetItemInvitationsForItemRoute,
} from '../api/routes';
import { mockHook, setUpTest } from '../../test/utils';
import {
  buildInvitation,
  ITEMS,
  UNAUTHORIZED_RESPONSE,
} from '../../test/constants';
import { buildInvitationKey, buildItemInvitationsKey } from '../config/keys';
import { Invitation } from '../types';

const { hooks, wrapper, queryClient } = setUpTest();
const itemPath = ITEMS[0].path;

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
      const response = buildInvitation({ itemPath });
      const endpoints = [{ route, response }];
      const { data } = await mockHook({ endpoints, hook, wrapper });

      expect((data as Map<string, unknown>).toJS()).toEqual(response);

      // verify cache keys
      expect(queryClient.getQueryData(key)).toEqual(Map(response));
    });

    it(`Undefined id does not fetch`, async () => {
      const response = buildInvitation({ itemPath });
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
    const itemId = ITEMS[0].id;
    const route = `/${buildGetItemInvitationsForItemRoute(itemId)}`;
    const key = buildItemInvitationsKey(itemId);

    const hook = () => hooks.useItemInvitations(itemId);

    it(`Receive invitations for item`, async () => {
      const response = [
        buildInvitation({ itemPath }),
        buildInvitation({ itemPath }),
        buildInvitation({ itemPath }),
      ];
      const endpoints = [{ route, response }];
      const { data } = await mockHook({ endpoints, hook, wrapper });

      expect((data as List<Invitation>).toJS()).toEqual(response);

      // verify cache keys
      expect(queryClient.getQueryData(key)).toEqual(List(response));
    });

    it(`Undefined id does not fetch`, async () => {
      const response = buildInvitation({ itemPath });
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

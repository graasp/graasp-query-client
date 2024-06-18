import { FolderItemFactory } from '@graasp/sdk';

import { StatusCodes } from 'http-status-codes';
import nock from 'nock';
import { afterEach, describe, expect, it } from 'vitest';

import {
  UNAUTHORIZED_RESPONSE,
  buildInvitation,
} from '../../test/constants.js';
import { mockHook, setUpTest } from '../../test/utils.js';
import { buildInvitationKey, itemKeys } from '../keys.js';
import {
  buildGetInvitationRoute,
  buildGetItemInvitationsForItemRoute,
} from '../routes.js';

const { hooks, wrapper, queryClient } = setUpTest();
const item = FolderItemFactory();

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
      const response = buildInvitation({ item });
      const endpoints = [{ route, response }];
      const { data } = await mockHook({ endpoints, hook, wrapper });

      expect(data).toMatchObject(response);

      // verify cache keys
      expect(queryClient.getQueryData(key)).toMatchObject(response);
    });

    it(`Undefined id does not fetch`, async () => {
      const response = buildInvitation({ item });
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
    const itemId = FolderItemFactory().id;
    const route = `/${buildGetItemInvitationsForItemRoute(itemId)}`;
    const key = itemKeys.single(itemId).invitation;

    const hook = () => hooks.useItemInvitations(itemId);

    it(`Receive invitations for item`, async () => {
      const response = [
        buildInvitation({ item }),
        buildInvitation({ item }),
        buildInvitation({ item }),
      ];
      const endpoints = [{ route, response }];
      const { data } = await mockHook({ endpoints, hook, wrapper });

      expect(data).toMatchObject(response);

      // verify cache keys
      expect(queryClient.getQueryData(key)).toEqual(response);
    });

    it(`Undefined id does not fetch`, async () => {
      const response = buildInvitation({ item });
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

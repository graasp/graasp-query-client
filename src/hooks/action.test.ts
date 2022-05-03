/* eslint-disable import/no-extraneous-dependencies */
import nock from 'nock';
import { Map } from 'immutable';
import { StatusCodes } from 'http-status-codes';
import Cookies from 'js-cookie';
import { mockHook, setUpTest } from '../../test/utils';
import {
  ACTIONS_DATA,
  ITEMS,
  UNAUTHORIZED_RESPONSE,
} from '../../test/constants';
import { buildGetActions } from '../api/routes';
import { buildActionsKey } from '../config/keys';

const { hooks, wrapper, queryClient } = setUpTest();
const itemId = ITEMS[0].id;

jest.spyOn(Cookies, 'get').mockReturnValue({ session: 'somesession' });
describe('Action Hooks', () => {
  afterEach(() => {
    nock.cleanAll();
    queryClient.clear();
  });

  describe('useActions', () => {
    const args = { itemId, view: 'builder', requestedSampleSize: 5 };
    const route = `/${buildGetActions(itemId, {
      view: args.view,
      requestedSampleSize: args.requestedSampleSize,
    })}`;
    const key = buildActionsKey(args);

    const response = ACTIONS_DATA;

    it(`Receive actions for item id`, async () => {
      const hook = () => hooks.useActions(args);
      const endpoints = [{ route, response }];
      const { data } = await mockHook({ endpoints, hook, wrapper });

      expect((data as Map<string, unknown>).get('actions')).toEqual(
        response.actions,
      );

      // verify cache keys
      expect(queryClient.getQueryData(key)).toEqual(Map(response));
    });

    it(`Sample size = 0 does not fetch`, async () => {
      const hook = () => hooks.useActions({ ...args, requestedSampleSize: 0 });
      const endpoints = [{ route, response }];
      const { data, isFetched } = await mockHook({
        endpoints,
        hook,
        wrapper,
        enabled: false,
      });

      expect(isFetched).toBeFalsy();
      expect(data).toBeFalsy();
      expect(queryClient.getQueryData(key)).toBeFalsy();
    });

    it(`enabled=false does not fetch`, async () => {
      const hook = () => hooks.useActions(args, { enabled: false });
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
      const hook = () => hooks.useActions(args);
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

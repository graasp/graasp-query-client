/* eslint-disable import/no-extraneous-dependencies */
import { StatusCodes } from 'http-status-codes';
import Cookies from 'js-cookie';
import nock from 'nock';

import { Context, convertJs } from '@graasp/sdk';

import {
  ACTIONS_DATA,
  AGGREGATE_ACTIONS_DATA,
  ITEMS,
  UNAUTHORIZED_RESPONSE,
} from '../../test/constants';
import { mockHook, setUpTest } from '../../test/utils';
import { buildGetActions, buildGetAggregateActions } from '../api/routes';
import { buildActionsKey, buildAggregateActionsKey } from '../config/keys';
import { AggregateFunction } from '../utils/action';

const { hooks, wrapper, queryClient } = setUpTest();
const itemId = ITEMS.first()!.id;

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
      const endpoints = [{ route, response: response.toJS() }];
      const { data } = await mockHook({ endpoints, hook, wrapper });
      expect(data).toEqualImmutable(response);

      // verify cache keys
      expect(queryClient.getQueryData(key)).toEqualImmutable(response);
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

  describe('useAggregateActions', () => {
    const args = {
      itemId,
      view: Context.Builder,
      requestedSampleSize: 5,
      type: 'update',
      countGroupBy: ['createdDay', 'user'],
      aggregateFunction: AggregateFunction.Avg,
      aggregateMetric: 'actionCount',
      aggregateBy: ['createdDay'],
    };
    const route = `/${buildGetAggregateActions(args)}`;
    const key = buildAggregateActionsKey(args);
    const response = AGGREGATE_ACTIONS_DATA;

    it(`Receive aggregate actions for item id`, async () => {
      const hook = () => hooks.useAggregateActions(args);
      const endpoints = [{ route, response }];
      const { data } = await mockHook({ endpoints, hook, wrapper });
      expect(data).toEqualImmutable(convertJs(response));

      // verify cache keys
      expect(queryClient.getQueryData(key)).toEqualImmutable(
        convertJs(response),
      );
    });

    it(`Unauthorized`, async () => {
      const hook = () => hooks.useAggregateActions(args);
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

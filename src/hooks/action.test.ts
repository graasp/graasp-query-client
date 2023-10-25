/* eslint-disable import/no-extraneous-dependencies */
import {
  ActionData,
  AggregateBy,
  AggregateFunction,
  AggregateMetric,
  Context,
  CountGroupBy,
} from '@graasp/sdk';

import { StatusCodes } from 'http-status-codes';
import Cookies from 'js-cookie';
import nock from 'nock';

import {
  ACTIONS_DATA,
  AGGREGATE_ACTIONS_DATA,
  ITEMS,
  UNAUTHORIZED_RESPONSE,
} from '../../test/constants';
import { mockHook, setUpTest } from '../../test/utils';
import { buildGetActions, buildGetAggregateActions } from '../api/routes';
import { buildActionsKey, buildAggregateActionsKey } from '../config/keys';

type AggregateActionsResponse = {
  aggregateResult: number;
  createdDay: string;
}[];

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
      expect(data).toEqual(response);

      // verify cache keys
      expect(queryClient.getQueryData<ActionData>(key)).toEqual(response);
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
      view: Context.Builder,
      requestedSampleSize: 5,
      type: ['update'],
      countGroupBy: [CountGroupBy.CreatedDay, CountGroupBy.User],
      aggregateFunction: AggregateFunction.Avg,
      aggregateMetric: AggregateMetric.ActionCount,
      aggregateBy: [AggregateBy.CreatedDay],
    };
    const route = `/${buildGetAggregateActions({ itemId, ...args })}`;
    const key = buildAggregateActionsKey(itemId, args);
    const response = AGGREGATE_ACTIONS_DATA;

    it(`Receive aggregate actions for item id`, async () => {
      const hook = () => hooks.useAggregateActions(itemId, args);
      const endpoints = [{ route, response }];
      const { data } = await mockHook({ endpoints, hook, wrapper });
      expect(data).toEqual(response);

      // verify cache keys
      expect(queryClient.getQueryData<AggregateActionsResponse>(key)).toEqual(
        response,
      );
    });
    it(`Receive aggregate actions for item id`, async () => {
      const hook = () => hooks.useAggregateActions(itemId, args);
      const endpoints = [{ route, response }];
      const { data } = await mockHook({ endpoints, hook, wrapper });
      expect(data).toEqual(response);

      // verify cache keys
      expect(queryClient.getQueryData<AggregateActionsResponse>(key)).toEqual(
        response,
      );
    });

    it(`Unauthorized`, async () => {
      const hook = () => hooks.useAggregateActions(itemId, args);
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

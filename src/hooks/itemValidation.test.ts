/* eslint-disable import/no-extraneous-dependencies */
import nock from 'nock';
import { List } from 'immutable';
import { StatusCodes } from 'http-status-codes';
import Cookies from 'js-cookie';
import { mockHook, setUpTest } from '../../test/utils';
import {
  buildGetItemValidationAndReviewRoute,
  buildGetItemValidationGroupsRoute,
  GET_ITEM_VALIDATION_REVIEWS_ROUTE,
  GET_ITEM_VALIDATION_REVIEW_STATUSES_ROUTE,
  GET_ITEM_VALIDATION_STATUSES_ROUTE,
} from '../api/routes';
import {
  buildItemValidationAndReviewKey,
  buildItemValidationGroupsKey,
  ITEM_VALIDATION_REVIEWS_KEY,
  ITEM_VALIDATION_REVIEW_STATUSES_KEY,
  ITEM_VALIDATION_STATUSES_KEY,
} from '../config/keys';
import {
  FULL_VALIDATION_RECORDS,
  ITEM_VALIDATION_GROUPS,
  ITEM_VALIDATION_STATUS,
  STATUS_LIST,
  UNAUTHORIZED_RESPONSE,
} from '../../test/constants';
import {
  FullValidationRecordRecord,
  ItemValidationAndReviewRecord,
  ItemValidationGroupRecord,
  StatusRecord,
} from '../types';

const { hooks, wrapper, queryClient } = setUpTest();

jest.spyOn(Cookies, 'get').mockReturnValue({ session: 'somesession' });

describe('Item Validation Hooks', () => {
  afterEach(() => {
    nock.cleanAll();
    queryClient.clear();
  });

  describe('useItemValidationReviews', () => {
    const route = `/${GET_ITEM_VALIDATION_REVIEWS_ROUTE}`;
    const key = ITEM_VALIDATION_REVIEWS_KEY;

    const hook = () => hooks.useValidationReview();

    it(`Receive item validation reviews`, async () => {
      const response = FULL_VALIDATION_RECORDS;
      const endpoints = [{ route, response }];
      const { data } = await mockHook({ endpoints, hook, wrapper });

      expect(data as List<FullValidationRecordRecord>).toEqualImmutable(
        response,
      );

      // verify cache keys
      expect(queryClient.getQueryData(key)).toEqualImmutable(response);
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

  describe('useItemValidationStatuses', () => {
    const route = `/${GET_ITEM_VALIDATION_STATUSES_ROUTE}`;
    const key = ITEM_VALIDATION_STATUSES_KEY;

    const hook = () => hooks.useItemValidationStatuses();

    it(`Receive list of status`, async () => {
      const response = STATUS_LIST;
      const endpoints = [{ route, response }];
      const { data } = await mockHook({ endpoints, hook, wrapper });

      expect(data as List<StatusRecord>).toEqualImmutable(response);

      // verify cache keys
      expect(queryClient.getQueryData(key)).toEqualImmutable(response);
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

  describe('useItemValidationReviewStatuses', () => {
    const route = `/${GET_ITEM_VALIDATION_REVIEW_STATUSES_ROUTE}`;
    const key = ITEM_VALIDATION_REVIEW_STATUSES_KEY;

    const hook = () => hooks.useItemValidationReviewStatuses();

    it(`Receive list of status`, async () => {
      const response = STATUS_LIST;
      const endpoints = [{ route, response }];
      const { data } = await mockHook({ endpoints, hook, wrapper });

      expect(data as List<StatusRecord>).toEqualImmutable(response);

      // verify cache keys
      expect(queryClient.getQueryData(key)).toEqualImmutable(response);
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

  describe('useItemValidationAndReview', () => {
    const itemId = 'item-id';
    const route = `/${buildGetItemValidationAndReviewRoute(itemId)}`;
    const key = buildItemValidationAndReviewKey(itemId);

    const hook = () => hooks.useItemValidationAndReview(itemId);

    it(`Receive validation records of given item`, async () => {
      const response = ITEM_VALIDATION_STATUS;
      const endpoints = [{ route, response }];
      const { data } = await mockHook({ endpoints, hook, wrapper });

      expect(data as ItemValidationAndReviewRecord).toEqualImmutable(response);

      // verify cache keys
      expect(queryClient.getQueryData(key)).toEqualImmutable(response);
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
  describe('useItemValidationGroups', () => {
    const iVId = 'item-validation-id';
    const route = `/${buildGetItemValidationGroupsRoute(iVId)}`;
    const key = buildItemValidationGroupsKey(iVId);

    const hook = () => hooks.useItemValidationGroups(iVId);

    it(`Receive item validation groups of given item-validation-id`, async () => {
      const response = ITEM_VALIDATION_GROUPS;
      const endpoints = [{ route, response }];
      const { data } = await mockHook({ endpoints, hook, wrapper });

      expect(data as List<ItemValidationGroupRecord>).toEqualImmutable(
        response,
      );

      // verify cache keys
      expect(queryClient.getQueryData(key)).toEqualImmutable(response);
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

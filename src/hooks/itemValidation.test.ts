/* eslint-disable import/no-extraneous-dependencies */
import nock from 'nock';
import { List } from 'immutable';
import { StatusCodes } from 'http-status-codes';
import Cookies from 'js-cookie';
import { mockHook, setUpTest } from '../../test/utils';
import {
  buildGetValidationStatusRoute,
  GET_ALL_STATUS_ROUTE,
  GET_VALIDATION_REVIEW_ROUTE,
} from '../api/routes';
import {
  ALL_STATUS_KEY,
  buildValidationStatusKey,
  VALIDATION_REVIEW_KEY,
} from '../config/keys';
import {
  FULL_VALIDATION_RECORDS,
  ITEM_VALIDATION_STATUS,
  STATUS_LIST,
  UNAUTHORIZED_RESPONSE,
} from '../../test/constants';
import { FullValidationRecord, ItemValidationStatus, Status } from '../types';

const { hooks, wrapper, queryClient } = setUpTest();

jest.spyOn(Cookies, 'get').mockReturnValue({ session: 'somesession' });

describe('Item Validation Hooks', () => {
  afterEach(() => {
    nock.cleanAll();
    queryClient.clear();
  });

  describe('useValidationReviews', () => {
    const route = `/${GET_VALIDATION_REVIEW_ROUTE}`;
    const key = VALIDATION_REVIEW_KEY;

    const hook = () => hooks.useValidationReview();

    it(`Receive validation reviews`, async () => {
      const response = FULL_VALIDATION_RECORDS;
      const endpoints = [{ route, response }];
      const { data } = await mockHook({ endpoints, hook, wrapper });

      expect((data as List<FullValidationRecord>).toJS()).toEqual(response);

      // verify cache keys
      expect(queryClient.getQueryData(key)).toEqual(List(response));
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

  describe('useAllStatus', () => {
    const route = `/${GET_ALL_STATUS_ROUTE}`;
    const key = ALL_STATUS_KEY;

    const hook = () => hooks.useAllStatus();

    it(`Receive list of status`, async () => {
      const response = STATUS_LIST;
      const endpoints = [{ route, response }];
      const { data } = await mockHook({ endpoints, hook, wrapper });

      expect((data as List<Status>).toJS()).toEqual(response);

      // verify cache keys
      expect(queryClient.getQueryData(key)).toEqual(List(response));
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

  describe('useValidationStatus', () => {
    const itemId = 'item-id';
    const route = `/${buildGetValidationStatusRoute(itemId)}`;
    const key = buildValidationStatusKey(itemId);

    const hook = () => hooks.useValidationStatus(itemId);

    it(`Receive validation records of given item`, async () => {
      const response = ITEM_VALIDATION_STATUS;
      const endpoints = [{ route, response }];
      const { data } = await mockHook({ endpoints, hook, wrapper });

      expect((data as List<ItemValidationStatus>).toJS()).toEqual(response);

      // verify cache keys
      expect(queryClient.getQueryData(key)).toEqual(List(response));
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

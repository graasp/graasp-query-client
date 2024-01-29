import { HttpMethod } from '@graasp/sdk';
import { SUCCESS_MESSAGES } from '@graasp/translations';

import { StatusCodes } from 'http-status-codes';
import nock from 'nock';
import { act } from 'react-test-renderer';
import { v4 } from 'uuid';

import { ITEM_GEOLOCATION, UNAUTHORIZED_RESPONSE } from '../../test/constants';
import { mockMutation, setUpTest, waitForMutation } from '../../test/utils';
import { buildPutItemGeolocationRoute } from '../api/routes';
import {
  buildItemGeolocationKey,
  itemsWithGeolocationKeys,
} from '../config/keys';
import {
  deleteItemGeolocationRoutine,
  putItemGeolocationRoutine,
} from '../routines';

const mockedNotifier = jest.fn();
const { wrapper, queryClient, mutations } = setUpTest({
  notifier: mockedNotifier,
});

describe('Item Flag Mutations', () => {
  afterEach(() => {
    queryClient.clear();
    nock.cleanAll();
  });

  describe('usePutItemGeolocation', () => {
    const itemId = v4();
    const key = buildItemGeolocationKey(itemId);
    const route = `/${buildPutItemGeolocationRoute(itemId)}`;
    const mutation = mutations.usePutItemGeolocation;
    const singleKey = itemsWithGeolocationKeys.inBounds({
      lat1: 0,
      lng1: 0,
      lat2: 1,
      lng2: 1,
    });

    it('Put item geolocation', async () => {
      // set some starting data
      queryClient.setQueryData(key, ITEM_GEOLOCATION);
      queryClient.setQueryData(singleKey, [ITEM_GEOLOCATION]);

      const response = {};

      const endpoints = [
        {
          response,
          method: HttpMethod.PUT,
          route,
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        await mockedMutation.mutate({ lat: 1, lng: 1, itemId });
        await waitForMutation();
      });

      expect(queryClient.getQueryState(key)?.isInvalidated).toBeTruthy();
      expect(queryClient.getQueryState(singleKey)?.isInvalidated).toBeTruthy();
      expect(mockedNotifier).toHaveBeenCalledWith({
        type: putItemGeolocationRoutine.SUCCESS,
        payload: { message: SUCCESS_MESSAGES.PUT_ITEM_GEOLOCATION },
      });
    });

    it('Unauthorized to put item geolocation', async () => {
      // set some starting data
      queryClient.setQueryData(key, ITEM_GEOLOCATION);
      queryClient.setQueryData(singleKey, [ITEM_GEOLOCATION]);

      const endpoints = [
        {
          response: UNAUTHORIZED_RESPONSE,
          statusCode: StatusCodes.UNAUTHORIZED,
          method: HttpMethod.PUT,
          route,
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        await mockedMutation.mutate({ lat: 1, lng: 1, itemId });
        await waitForMutation();
      });

      expect(queryClient.getQueryState(key)?.isInvalidated).toBeTruthy();
      expect(queryClient.getQueryState(singleKey)?.isInvalidated).toBeTruthy();
      expect(mockedNotifier).toHaveBeenCalledWith(
        expect.objectContaining({
          type: putItemGeolocationRoutine.FAILURE,
          payload: { error: expect.anything() },
        }),
      );
    });
  });

  describe('useDeleteItemGeolocation', () => {
    const itemId = v4();
    const key = buildItemGeolocationKey(itemId);
    const route = `/${buildPutItemGeolocationRoute(itemId)}`;
    const mutation = mutations.useDeleteItemGeolocation;
    const singleKey = itemsWithGeolocationKeys.inBounds({
      lat1: 0,
      lng1: 0,
      lat2: 1,
      lng2: 1,
    });

    it('Delete item geolocation', async () => {
      // set some starting data
      queryClient.setQueryData(key, ITEM_GEOLOCATION);
      queryClient.setQueryData(singleKey, [ITEM_GEOLOCATION]);

      const response = {};

      const endpoints = [
        {
          response,
          method: HttpMethod.DELETE,
          route,
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        await mockedMutation.mutate({ itemId });
        await waitForMutation();
      });

      expect(queryClient.getQueryState(key)?.isInvalidated).toBeTruthy();
      expect(queryClient.getQueryState(singleKey)?.isInvalidated).toBeTruthy();
      expect(mockedNotifier).toHaveBeenCalledWith({
        type: deleteItemGeolocationRoutine.SUCCESS,
        payload: { message: SUCCESS_MESSAGES.DELETE_ITEM_GEOLOCATION },
      });
    });

    it('Unauthorized to delete item geolocation', async () => {
      // set some starting data
      queryClient.setQueryData(key, ITEM_GEOLOCATION);
      queryClient.setQueryData(singleKey, [ITEM_GEOLOCATION]);

      const endpoints = [
        {
          response: UNAUTHORIZED_RESPONSE,
          statusCode: StatusCodes.UNAUTHORIZED,
          method: HttpMethod.DELETE,
          route,
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        await mockedMutation.mutate({ itemId });
        await waitForMutation();
      });

      expect(queryClient.getQueryState(key)?.isInvalidated).toBeTruthy();
      expect(queryClient.getQueryState(singleKey)?.isInvalidated).toBeTruthy();
      expect(mockedNotifier).toHaveBeenCalledWith(
        expect.objectContaining({
          type: deleteItemGeolocationRoutine.FAILURE,
          payload: { error: expect.anything() },
        }),
      );
    });
  });
});

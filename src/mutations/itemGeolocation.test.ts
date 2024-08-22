import { HttpMethod } from '@graasp/sdk';
import { SUCCESS_MESSAGES } from '@graasp/translations';

import { act } from '@testing-library/react';
import { StatusCodes } from 'http-status-codes';
import nock from 'nock';
import { v4 } from 'uuid';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  ITEM_GEOLOCATION,
  UNAUTHORIZED_RESPONSE,
} from '../../test/constants.js';
import { mockMutation, setUpTest, waitForMutation } from '../../test/utils.js';
import { itemKeys, itemsWithGeolocationKeys } from '../keys.js';
import { buildPutItemGeolocationRoute } from '../routes.js';
import {
  deleteItemGeolocationRoutine,
  putItemGeolocationRoutine,
} from '../routines/itemGeolocation.js';

const mockedNotifier = vi.fn();
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
    const key = itemKeys.single(itemId).geolocation;
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
          method: HttpMethod.Put,
          route,
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        mockedMutation.mutate({
          geolocation: {
            lat: 1,
            lng: 1,
            addressLabel: 'address',
            country: 'country',
          },
          itemId,
        });
        await waitForMutation();
      });

      expect(queryClient.getQueryState(key)?.isInvalidated).toBeTruthy();
      expect(queryClient.getQueryState(singleKey)?.isInvalidated).toBeTruthy();
      expect(mockedNotifier).toHaveBeenCalledWith({
        type: putItemGeolocationRoutine.SUCCESS,
        payload: { message: SUCCESS_MESSAGES.PUT_ITEM_GEOLOCATION },
      });
    });

    it('Put item geolocation without address and country', async () => {
      // set some starting data
      queryClient.setQueryData(key, ITEM_GEOLOCATION);
      queryClient.setQueryData(singleKey, [ITEM_GEOLOCATION]);

      const response = {};

      const endpoints = [
        {
          response,
          method: HttpMethod.Put,
          route,
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        mockedMutation.mutate({
          geolocation: { lat: 1, lng: 1 },
          itemId,
        });
        await waitForMutation();
      });

      expect(queryClient.getQueryState(key)?.isInvalidated).toBeTruthy();
      expect(queryClient.getQueryState(singleKey)?.isInvalidated).toBeTruthy();
      expect(mockedNotifier).toHaveBeenCalledWith({
        type: putItemGeolocationRoutine.SUCCESS,
        payload: { message: SUCCESS_MESSAGES.PUT_ITEM_GEOLOCATION },
      });
    });

    it('Put item geolocation with helper text and lat and lng', async () => {
      // set some starting data
      queryClient.setQueryData(key, ITEM_GEOLOCATION);
      queryClient.setQueryData(singleKey, [ITEM_GEOLOCATION]);

      const response = {};

      const endpoints = [
        {
          response,
          method: HttpMethod.Put,
          route,
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        mockedMutation.mutate({
          geolocation: { lat: 1, lng: 2, helperLabel: 'helperlabel' },
          itemId,
        });
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
          method: HttpMethod.Put,
          route,
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        mockedMutation.mutate({
          geolocation: { lat: 1, lng: 1 },
          itemId,
        });
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
    const key = itemKeys.single(itemId).geolocation;
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
          method: HttpMethod.Delete,
          route,
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        mockedMutation.mutate({ itemId });
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
          method: HttpMethod.Delete,
          route,
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        mockedMutation.mutate({ itemId });
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

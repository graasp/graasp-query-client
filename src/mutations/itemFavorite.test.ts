import { HttpMethod } from '@graasp/sdk';

import { act } from '@testing-library/react';
import { StatusCodes } from 'http-status-codes';
import nock from 'nock';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { UNAUTHORIZED_RESPONSE } from '../../test/constants.js';
import { mockMutation, setUpTest, waitForMutation } from '../../test/utils.js';
import { buildFavoriteItemRoute } from '../api/routes.js';
import { memberKeys } from '../config/keys.js';
import {
  addFavoriteItemRoutine,
  deleteFavoriteItemRoutine,
} from '../routines/itemFavorite.js';

const mockedNotifier = vi.fn();
const { wrapper, queryClient, mutations } = setUpTest({
  notifier: mockedNotifier,
});
describe('Favorite Mutations', () => {
  afterEach(() => {
    queryClient.clear();
    nock.cleanAll();
  });

  describe('useAddFavoriteItem', () => {
    const itemId = 'item-id';
    const route = `/${buildFavoriteItemRoute(itemId)}`;
    const mutation = mutations.useAddFavoriteItem;

    it(`Successfully add favorite item`, async () => {
      // set random data in cache
      queryClient.setQueryData(memberKeys.current().favoriteItems, 'mock');
      const endpoints = [
        {
          response: itemId,
          method: HttpMethod.Post,
          route,
        },
      ];
      const mockedMutation = await mockMutation({
        mutation,
        wrapper,
        endpoints,
      });

      await act(async () => {
        mockedMutation.mutate(itemId);
        await waitForMutation();
      });

      expect(
        queryClient.getQueryState(memberKeys.current().favoriteItems)
          ?.isInvalidated,
      ).toBeTruthy();
      expect(mockedNotifier).toHaveBeenCalledWith({
        type: addFavoriteItemRoutine.SUCCESS,
      });
    });

    it(`Unauthorized`, async () => {
      const endpoints = [
        {
          response: UNAUTHORIZED_RESPONSE,
          statusCode: StatusCodes.UNAUTHORIZED,
          method: HttpMethod.Post,
          route,
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        mockedMutation.mutate(itemId);
        await waitForMutation();
      });

      expect(mockedNotifier).toHaveBeenCalledWith(
        expect.objectContaining({
          type: addFavoriteItemRoutine.FAILURE,
        }),
      );
    });
  });

  describe('useRemoveFavoriteItem', () => {
    const itemId = 'item-id';
    const route = `/${buildFavoriteItemRoute(itemId)}`;
    const mutation = mutations.useRemoveFavoriteItem;

    it('Delete item like', async () => {
      queryClient.setQueryData(memberKeys.current().favoriteItems, itemId);

      const endpoints = [
        {
          response: itemId,
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
        mockedMutation.mutate(itemId);
        await waitForMutation();
      });

      expect(
        queryClient.getQueryState(memberKeys.current().favoriteItems)
          ?.isInvalidated,
      ).toBeTruthy();
      expect(mockedNotifier).toHaveBeenCalledWith({
        type: deleteFavoriteItemRoutine.SUCCESS,
      });
    });

    it('Unauthorized to delete item like', async () => {
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
        mockedMutation.mutate(itemId);
        await waitForMutation();
      });

      expect(mockedNotifier).toHaveBeenCalledWith(
        expect.objectContaining({
          type: deleteFavoriteItemRoutine.FAILURE,
        }),
      );
    });
  });
});

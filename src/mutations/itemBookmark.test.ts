import { HttpMethod } from '@graasp/sdk';

import { act } from '@testing-library/react';
import { StatusCodes } from 'http-status-codes';
import nock from 'nock';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { UNAUTHORIZED_RESPONSE } from '../../test/constants.js';
import { mockMutation, setUpTest, waitForMutation } from '../../test/utils.js';
import { memberKeys } from '../keys.js';
import { buildBookmarkedItemRoute } from '../routes.js';
import {
  addBookmarkedItemRoutine,
  deleteBookmarkedItemRoutine,
} from '../routines/itemBookmark.js';

const mockedNotifier = vi.fn();
const { wrapper, queryClient, mutations } = setUpTest({
  notifier: mockedNotifier,
});
describe('Bookmarked Mutations', () => {
  afterEach(() => {
    queryClient.clear();
    nock.cleanAll();
  });

  describe('useAddBookmarkedItem', () => {
    const itemId = 'item-id';
    const route = `/${buildBookmarkedItemRoute(itemId)}`;
    const mutation = mutations.useAddBookmarkedItem;

    it(`Successfully add bookmarked item`, async () => {
      // set random data in cache
      queryClient.setQueryData(memberKeys.current().bookmarkedItems, 'mock');
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
        queryClient.getQueryState(memberKeys.current().bookmarkedItems)
          ?.isInvalidated,
      ).toBeTruthy();
      expect(mockedNotifier).toHaveBeenCalledWith({
        type: addBookmarkedItemRoutine.SUCCESS,
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
          type: addBookmarkedItemRoutine.FAILURE,
        }),
      );
    });
  });

  describe('useRemoveBookmarkedItem', () => {
    const itemId = 'item-id';
    const route = `/${buildBookmarkedItemRoute(itemId)}`;
    const mutation = mutations.useRemoveBookmarkedItem;

    it('Delete item like', async () => {
      queryClient.setQueryData(memberKeys.current().bookmarkedItems, itemId);

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
        queryClient.getQueryState(memberKeys.current().bookmarkedItems)
          ?.isInvalidated,
      ).toBeTruthy();
      expect(mockedNotifier).toHaveBeenCalledWith({
        type: deleteBookmarkedItemRoutine.SUCCESS,
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
          type: deleteBookmarkedItemRoutine.FAILURE,
        }),
      );
    });
  });
});

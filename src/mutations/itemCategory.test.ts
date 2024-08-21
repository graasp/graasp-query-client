import { HttpMethod } from '@graasp/sdk';
import { SUCCESS_MESSAGES } from '@graasp/translations';

import { act } from '@testing-library/react';
import { StatusCodes } from 'http-status-codes';
import nock from 'nock';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  ITEM_CATEGORIES,
  UNAUTHORIZED_RESPONSE,
} from '../../test/constants.js';
import { mockMutation, setUpTest, waitForMutation } from '../../test/utils.js';
import { itemKeys } from '../keys.js';
import {
  buildDeleteItemCategoryRoute,
  buildPostItemCategoryRoute,
} from '../routes.js';
import {
  deleteItemCategoryRoutine,
  postItemCategoryRoutine,
} from '../routines/itemCategory.js';

const mockedNotifier = vi.fn();
const { wrapper, queryClient, mutations } = setUpTest({
  notifier: mockedNotifier,
});

describe('Item Category Mutations', () => {
  afterEach(() => {
    queryClient.clear();
    nock.cleanAll();
  });

  describe('usePostItemCategory', () => {
    const itemId = 'item-id';
    const categoryId = 'new-category';
    const route = `/${buildPostItemCategoryRoute(itemId)}`;
    const mutation = mutations.usePostItemCategory;
    const key = itemKeys.single(itemId).categories;

    it('Post item category', async () => {
      queryClient.setQueryData(key, ITEM_CATEGORIES);

      const endpoints = [
        {
          response: { itemId: 'item-id', categoryId: 'new-category' },
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
        mockedMutation.mutate({
          itemId,
          categoryId,
        });
        await waitForMutation();
      });

      expect(queryClient.getQueryState(key)?.isInvalidated).toBeTruthy();
      expect(mockedNotifier).toHaveBeenCalledWith({
        type: postItemCategoryRoutine.SUCCESS,
        payload: { message: SUCCESS_MESSAGES.POST_ITEM_CATEGORY },
      });
    });
    it('Unauthorized to post item category', async () => {
      queryClient.setQueryData(key, ITEM_CATEGORIES);
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
        mockedMutation.mutate({ itemId, categoryId });
        await waitForMutation();
      });

      expect(queryClient.getQueryState(key)?.isInvalidated).toBeTruthy();
      expect(mockedNotifier).toHaveBeenCalledWith(
        expect.objectContaining({
          type: postItemCategoryRoutine.FAILURE,
        }),
      );
    });
  });

  describe('useDeleteItemCategory', () => {
    const itemCategoryId = 'id1';
    const itemId = 'item-id';
    const route = `/${buildDeleteItemCategoryRoute({
      itemId,
      itemCategoryId,
    })}`;
    const mutation = mutations.useDeleteItemCategory;
    const key = itemKeys.single(itemId).categories;

    it('Delete item category', async () => {
      queryClient.setQueryData(key, ITEM_CATEGORIES);

      const endpoints = [
        {
          response: { itemId: 'item-id' },
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
        mockedMutation.mutate({
          itemCategoryId,
          itemId,
        });
        await waitForMutation();
      });

      expect(queryClient.getQueryState(key)?.isInvalidated).toBeTruthy();
      expect(mockedNotifier).toHaveBeenCalledWith(
        expect.objectContaining({
          type: deleteItemCategoryRoutine.SUCCESS,
        }),
      );
    });
    it('Unauthorized to delete item category', async () => {
      queryClient.setQueryData(key, ITEM_CATEGORIES);
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
        mockedMutation.mutate({ itemCategoryId, itemId });
        await waitForMutation();
      });

      expect(queryClient.getQueryState(key)?.isInvalidated).toBeTruthy();
      expect(mockedNotifier).toHaveBeenCalledWith(
        expect.objectContaining({
          type: deleteItemCategoryRoutine.FAILURE,
        }),
      );
    });
  });
});

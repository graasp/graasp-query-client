/* eslint-disable import/no-extraneous-dependencies */
import { StatusCodes } from 'http-status-codes';
import Cookies from 'js-cookie';
import nock from 'nock';
import { act } from 'react-test-renderer';

import { HttpMethod } from '@graasp/sdk';
import { SUCCESS_MESSAGES } from '@graasp/translations';

import { ITEM_CATEGORIES, UNAUTHORIZED_RESPONSE } from '../../test/constants';
import { mockMutation, setUpTest, waitForMutation } from '../../test/utils';
import {
  buildDeleteItemCategoryRoute,
  buildPostItemCategoryRoute,
} from '../api/routes';
import { MUTATION_KEYS, buildItemCategoriesKey } from '../config/keys';
import {
  deleteItemCategoryRoutine,
  postItemCategoryRoutine,
} from '../routines';

const mockedNotifier = jest.fn();
const { wrapper, queryClient, useMutation } = setUpTest({
  notifier: mockedNotifier,
});

jest.spyOn(Cookies, 'get').mockReturnValue({ session: 'somesession' });

describe('Item Category Mutations', () => {
  afterEach(() => {
    queryClient.clear();
    nock.cleanAll();
  });

  describe(MUTATION_KEYS.POST_ITEM_CATEGORY, () => {
    const itemId = 'item-id';
    const categoryId = 'new-category';
    const route = `/${buildPostItemCategoryRoute(itemId)}`;
    const mutation = () => useMutation(MUTATION_KEYS.POST_ITEM_CATEGORY);
    const key = buildItemCategoriesKey(itemId);

    it('Post item category', async () => {
      queryClient.setQueryData(key, ITEM_CATEGORIES);

      const endpoints = [
        {
          response: { itemId: 'item-id', categoryId: 'new-category' },
          method: HttpMethod.POST,
          route,
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        await mockedMutation.mutate({
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
          method: HttpMethod.POST,
          route,
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        await mockedMutation.mutate({ itemId, categoryId });
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

  describe(MUTATION_KEYS.DELETE_ITEM_CATEGORY, () => {
    const itemCategoryId = 'id1';
    const itemId = 'item-id';
    const route = `/${buildDeleteItemCategoryRoute({
      itemId,
      itemCategoryId,
    })}`;
    const mutation = () => useMutation(MUTATION_KEYS.DELETE_ITEM_CATEGORY);
    const key = buildItemCategoriesKey(itemId);

    it('Delete item category', async () => {
      queryClient.setQueryData(key, ITEM_CATEGORIES);

      const endpoints = [
        {
          response: { itemId: 'item-id' },
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
        await mockedMutation.mutate({
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
          method: HttpMethod.POST,
          route,
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        await mockedMutation.mutate({ itemCategoryId, itemId });
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

/* eslint-disable import/no-extraneous-dependencies */
import nock from 'nock';
import Cookies from 'js-cookie';
import { act } from 'react-test-renderer';
import { List } from 'immutable';
import { StatusCodes } from 'http-status-codes';
import { mockMutation, setUpTest, waitForMutation } from '../../test/utils';
import { REQUEST_METHODS } from '../api/utils';
import { buildItemCategoriesKey, MUTATION_KEYS } from '../config/keys';
import {
  buildDeleteItemCategoryRoute,
  buildPostItemCategoryRoute,
} from '../api/routes';
import {
  deleteItemCategoryRoutine,
  postItemCategoryRoutine,
} from '../routines';
import { ITEM_CATEGORIES, UNAUTHORIZED_RESPONSE } from '../../test/constants';

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
      queryClient.setQueryData(key, List([ITEM_CATEGORIES]));

      const endpoints = [
        {
          response: { itemId: 'item-id', categoryId: 'new-category' },
          method: REQUEST_METHODS.POST,
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
      });
    });
    it('Unauthorized to post item category', async () => {
      queryClient.setQueryData(key, List([ITEM_CATEGORIES]));
      const endpoints = [
        {
          response: UNAUTHORIZED_RESPONSE,
          statusCode: StatusCodes.UNAUTHORIZED,
          method: REQUEST_METHODS.POST,
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
      queryClient.setQueryData(key, List([ITEM_CATEGORIES]));

      const endpoints = [
        {
          response: { itemId: 'item-id' },
          method: REQUEST_METHODS.DELETE,
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
      queryClient.setQueryData(key, List([ITEM_CATEGORIES]));
      const endpoints = [
        {
          response: UNAUTHORIZED_RESPONSE,
          statusCode: StatusCodes.UNAUTHORIZED,
          method: REQUEST_METHODS.POST,
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

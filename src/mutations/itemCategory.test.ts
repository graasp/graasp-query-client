/* eslint-disable import/no-extraneous-dependencies */
import nock from 'nock';
import { act } from 'react-test-renderer';
import { mockMutation, setUpTest, waitForMutation } from '../../test/utils';
import { REQUEST_METHODS } from '../api/utils';
import { buildItemCategoryKey, MUTATION_KEYS } from '../config/keys';
import { buildDeleteItemCategoryRoute, buildPostItemCategoryRoute } from '../api/routes';
import { postItemCategoryRoutine } from '../routines';
import { ITEM_CATEGORIES } from '../../test/constants';
import { List } from 'immutable';

const mockedNotifier = jest.fn();
const { wrapper, queryClient, useMutation } = setUpTest({
  notifier: mockedNotifier,
});
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
    const key = buildItemCategoryKey(itemId);

    it('Post item category', async () => {
      queryClient.setQueryData(key, List([ITEM_CATEGORIES]));

      const endpoints = [
        {
          response: {},
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
          id: itemId,
          categoryId,
        });
        await waitForMutation();
      });

      expect(queryClient.getQueryState(key)?.isInvalidated).toBeTruthy();
      expect(mockedNotifier).toHaveBeenCalledWith({
        type: postItemCategoryRoutine.SUCCESS,
      });
    });
  });

  describe(MUTATION_KEYS.DELETE_ITEM_CATEGORY, () => {
    const entryId = 'id1';
    const itemId = 'item-id';
    const route = `/${buildDeleteItemCategoryRoute(entryId)}`;
    const mutation = () => useMutation(MUTATION_KEYS.DELETE_ITEM_CATEGORY);
    const key = buildItemCategoryKey(itemId);

    it('Delete item category', async () => {
      queryClient.setQueryData(key, List([ITEM_CATEGORIES]));

      const endpoints = [
        {
          response: {},
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
          entryId,
          id: itemId}
        );
        await waitForMutation();
      });

      expect(queryClient.getQueryState(key)?.isInvalidated).toBeTruthy();
      expect(mockedNotifier).toHaveBeenCalledWith({
        type: postItemCategoryRoutine.SUCCESS,
      });
    });
  });
});
